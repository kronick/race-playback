import { PositionsArray } from "../../shared-types/race-data";
import { MercatorCoordinate } from "mapbox-gl";
import {
  unitNormal,
  mult,
  clamp,
  add,
  unit,
  opposite,
  crossProduct,
  subtract,
  Vec2
} from "./vector-utils";

export default function generateLineArray(positions: PositionsArray): number[] {
  let lastCross = 0;

  return positions.flatMap((p, i) => {
    const thisPoint = projectPoint(p);
    const nextPoint =
      i === positions.length - 1 ? null : projectPoint(positions[i + 1]);
    const previousPoint = i === 0 ? null : projectPoint(positions[i - 1]);

    // Line start
    if (i === 0 && nextPoint) {
      const normal = unitNormal(thisPoint, nextPoint);
      console.log(normal);
      return [
        ...thisPoint,
        normal[0],
        normal[1],
        p.timestamp,
        ...thisPoint,
        -normal[0],
        -normal[1],
        p.timestamp
      ];
    } else if (nextPoint && previousPoint) {
      const A = subtract(previousPoint, thisPoint);
      const B = subtract(thisPoint, nextPoint);
      const thisCross = crossProduct(A, B);

      const flip =
        (thisCross > 0 && lastCross < 0) || (thisCross < 0 && lastCross > 0);
      lastCross = thisCross;

      const t = thisCross < 0;
      const prevNormal = unitNormal(previousPoint, thisPoint);
      const nextNormal = unitNormal(thisPoint, nextPoint);
      const normalA = t ? nextNormal : opposite(prevNormal);
      const normalB = t ? prevNormal : opposite(nextNormal);

      const extrudeA = t ? normalB : normalA;
      const extrudeB = t ? normalA : normalB;

      let joinNormal = unit(add(normalA, normalB));

      // From https://github.com/mapbox/mapbox-gl-js/blob/master/src/data/bucket/line_bucket.js
      /*  joinNormal     prevNormal
       *             ↖      ↑
       *                .________. prevVertex
       *                |
       * nextNormal  ←  |  currentVertex
       *                |
       *     nextVertex !
       *
       */

      // calculate cosines of the angle (and its half) using dot product
      // const cosAngle =
      //   prevNormal[0] * nextNormal[0] + prevNormal[1] * nextNormal[1];
      const cosHalfAngle =
        joinNormal[0] * nextNormal[0] + joinNormal[1] * nextNormal[1];
      const miterLength = clamp(
        cosHalfAngle !== 0 ? 1 / cosHalfAngle : Infinity,
        -2,
        2
      );

      const extrudeC = mult(joinNormal, (t ? -1 : 1) * miterLength);

      // Junction required
      if (flip) {
        return [
          ...thisPoint,
          ...extrudeC,
          p.timestamp,
          ...thisPoint, // Miter corner A
          ...extrudeA,
          p.timestamp,
          ...thisPoint, // Miter corner B
          ...extrudeB,
          p.timestamp,
          ...thisPoint, // Repeat third point to produce degenerate triangle
          ...extrudeB,
          p.timestamp,
          ...thisPoint, // Repeat interior point
          ...extrudeC,
          p.timestamp
        ];
      } else {
        return [
          ...thisPoint, // Miter corner A
          ...extrudeA,
          p.timestamp,
          ...thisPoint,
          ...extrudeC,
          p.timestamp,
          ...thisPoint, // Miter corner B
          ...extrudeB,
          p.timestamp,
          ...thisPoint, // Repeat third point to produce degenerate triangle
          ...extrudeB,
          p.timestamp,
          ...thisPoint, // Repeat interior point
          ...extrudeC,
          p.timestamp
        ];
      }
    } else if (previousPoint) {
      // Final point
      const normal = unitNormal(previousPoint, thisPoint);
      console.log(normal);
      return [
        ...thisPoint,
        -normal[0],
        -normal[1],
        p.timestamp,
        ...thisPoint,
        normal[0],
        normal[1],
        p.timestamp
      ];
    } else {
      return [];
    }
  });
}

function projectPoint(p: { coordinates: Vec2 }): Vec2 {
  const o = MercatorCoordinate.fromLngLat({
    lng: p.coordinates[0],
    lat: p.coordinates[1]
  });
  return [o.x, o.y];
}
