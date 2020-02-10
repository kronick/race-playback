import { RaceData } from "../shared-types/race-data";
import { GeoJSON } from "../shared-types/geojson";

import { distance } from "@turf/turf";

const parseRaceData = (
  input: string,
  timeBetweenPointInSeconds: number = 30
): RaceData => {
  const vesselPoints = input.split("^");

  const indexToTime = (i: number) => (i * timeBetweenPointInSeconds) / 60;

  let out = {
    vessels: vesselPoints.map((v, i) => {
      const coords = parseCoordinateString(v);

      // Generate line segments with speed property
      const speedFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];
      let lastGoodPoint: {
        coord: [number, number];
        timestamp: number;
      } | null = null;
      coords.forEach((c, i) => {
        // Skip null points
        if (c === null) return;

        // If this is the first good point
        if (!lastGoodPoint) {
          lastGoodPoint = { coord: c, timestamp: indexToTime(i) };
          return;
        }

        const dT = indexToTime(i) - lastGoodPoint.timestamp;
        const dP = distance(lastGoodPoint.coord, c);
        const speed = (dP / dT) * 32.3974082; // km / minute -> nm / hour

        speedFeatures.push({
          type: "Feature" as const,
          properties: { speed, timestamp: indexToTime(i) },
          geometry: {
            type: "LineString" as const,
            coordinates: [lastGoodPoint.coord, c]
          }
        });

        lastGoodPoint = { coord: c, timestamp: indexToTime(i) };
      });

      const path: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: coords.filter(c => c !== null) as [number, number][]
        }
      };

      return {
        name: `Vessel ${i}`,
        path,
        pathWithSpeeds: {
          type: "FeatureCollection" as const,
          features: speedFeatures,
          properties: {}
        },
        positions: coords
          .map((c, i) => ({ timestamp: indexToTime(i), coordinates: c }))
          .filter(c => c.coordinates !== null) as {
          timestamp: number;
          coordinates: [number, number];
        }[]
      };
    })
  };

  return {
    ...out,
    meta: {
      lengthInMinutes: Math.max(
        ...out.vessels.map(v => v.positions[v.positions.length - 1].timestamp)
      )
    }
  };
};

const parseCoordinateString = (
  input: string
): Array<[number, number] | null> => {
  const parts = input.split("*");
  return parts.map(p =>
    p === "no_no"
      ? null
      : (p
          .split("_", 2)
          .map(n => Number(n))
          .reverse() as [number, number])
  );
};

export default parseRaceData;
