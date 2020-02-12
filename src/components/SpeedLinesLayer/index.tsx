import React, { useContext, useEffect, useRef, useState } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import MapboxMapContext from "../MapboxMap/MapboxMapContext";
import { VesselData, PositionsArray } from "../../shared-types/race-data";
import { CustomLayerInterface, MercatorCoordinate } from "mapbox-gl";

import usePrefetch from "../shared-hooks/usePrefetch";
//const vertexSource = raw("./shaders/speed-lines.vert");
//const fragmentSource = raw("./shaders/speed-lines.frag");

type SpeedLinesLayerProps = {
  vessel: VesselData;
};
const SpeedLinesLayerComponent: React.FC<SpeedLinesLayerProps> = ({
  vessel
}) => {
  const { currentTime } = useContext(TimeContext);
  const { map } = useContext(MapboxMapContext);

  const { data: fragmentSource, status: fragmentSourceStatus } = usePrefetch(
    process.env.PUBLIC_URL + "/shaders/speed-lines.frag"
  );
  const { data: vertexSource, status: vertexSourceStatus } = usePrefetch(
    process.env.PUBLIC_URL + "/shaders/speed-lines.vert"
  );

  const [renderer, setRenderer] = useState<SpeedLinesLayer | null>(null);

  const [initialized, setInitialized] = useState(false);

  // Set up map to use this context
  useEffect(() => {
    if (map === null) return;
    if (
      vertexSourceStatus === "ready" &&
      fragmentSourceStatus === "ready" &&
      !initialized
    ) {
      const newRenderer = new SpeedLinesLayer(
        "custom",
        vessel.positions,
        fragmentSource,
        vertexSource
      );
      setRenderer(newRenderer);

      map.addLayer(newRenderer, "building");

      // Flag to not run this again
      setInitialized(true);
    }
  }, [
    map,
    fragmentSource,
    fragmentSourceStatus,
    vertexSource,
    vertexSourceStatus
  ]);

  // Update renderer's time whenever this components time is updated
  useEffect(() => {
    renderer?.setTime(currentTime);
  }, [renderer, currentTime]);

  // No DOM output
  return null;
};

export default SpeedLinesLayerComponent;

class SpeedLinesLayer implements CustomLayerInterface {
  id = "";
  type = "custom" as const;
  program: WebGLProgram | null = null;
  /** Cached index of GL vertex attribute */
  aPos: number = 0;
  aExtrude: number = 0;
  aTime: number = 0;
  buffer: WebGLBuffer | null = null;

  fragmentSource: string;
  vertexSource: string;

  positions: PositionsArray;
  nVertices: number = 0;

  /** Length of trail behind each point (in same unit as input timestamps) */
  trailLength = 10;

  time: number = 0;
  map: mapboxgl.Map | null = null;

  static floatsPerVertex = 5;

  constructor(
    id: string,
    positions: PositionsArray,
    fragmentShader: string,
    vertexShader: string
  ) {
    this.id = id;
    this.fragmentSource = fragmentShader;
    this.vertexSource = vertexShader;

    this.positions = positions;
  }

  setTime(t: number) {
    this.time = t;
    // Force map to update and re-render
    this.map?.triggerRepaint();
  }

  initializeShaders(gl: WebGLRenderingContext) {
    // create a vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) {
      throw new Error("Could not create vertex shader.");
    }
    gl.shaderSource(vertexShader, this.vertexSource);
    gl.compileShader(vertexShader);

    // create a fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
      throw new Error("Could not create fragment shader.");
    }
    gl.shaderSource(fragmentShader, this.fragmentSource);
    gl.compileShader(fragmentShader);

    // link the two shaders into a WebGL program
    this.program = gl.createProgram();
    if (!this.program) {
      throw new Error("Could not create glsl program");
    }

    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
  }

  onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    this.map = map;

    this.initializeShaders(gl);

    this.aPos = gl.getAttribLocation(this.program!, "a_pos");
    this.aExtrude = gl.getAttribLocation(this.program!, "a_extrude");
    this.aTime = gl.getAttribLocation(this.program!, "a_time");

    // create and initialize a WebGLBuffer to store vertex and color data
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    const data = generateLineArray(this.positions);
    this.nVertices = data.length / SpeedLinesLayer.floatsPerVertex;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  }

  render(gl: WebGLRenderingContext, matrix: number[]) {
    if (!this.program || !this.map) return;

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program, "u_matrix"),
      false,
      matrix
    );

    gl.uniform1f(
      gl.getUniformLocation(this.program, "u_width"),
      0.004 //0.000001 * (Math.cos(performance.now() / 500) + 1.5)
    );

    gl.uniform1f(
      gl.getUniformLocation(this.program, "u_zoom_factor"),
      1 / Math.pow(2, this.map.getZoom())
    );

    gl.uniform1f(gl.getUniformLocation(this.program, "u_time_min"), this.time);
    gl.uniform1f(
      gl.getUniformLocation(this.program, "u_time_max"),
      this.time - this.trailLength
    );

    // Tell OpenGL where to find the vertex coordinates within the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(
      this.aPos,
      2,
      gl.FLOAT,
      false,
      SpeedLinesLayer.floatsPerVertex * 4, // 4 bytes per float
      0
    );

    gl.enableVertexAttribArray(this.aExtrude);
    gl.vertexAttribPointer(
      this.aExtrude,
      2,
      gl.FLOAT,
      false,
      SpeedLinesLayer.floatsPerVertex * 4, // 4 bytes per float
      8
    );

    gl.enableVertexAttribArray(this.aTime);
    gl.vertexAttribPointer(
      this.aTime,
      1,
      gl.FLOAT,
      false,
      SpeedLinesLayer.floatsPerVertex * 4, // 4 bytes per float
      16
    );

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.nVertices);
  }
}

function generateLineArray(positions: PositionsArray): number[] {
  let lastCross = 0;

  return positions.flatMap((p, i) => {
    const thisPoint = projectPoint(p);
    const nextPoint =
      i === positions.length - 1 ? null : projectPoint(positions[i + 1]);
    const previousPoint = i === 0 ? null : projectPoint(positions[i - 1]);

    // Line start
    if (i === 0 && nextPoint) {
      const normal = calcUnitNormal(thisPoint, nextPoint);
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
      const prevNormal = calcUnitNormal(previousPoint, thisPoint);
      const nextNormal = calcUnitNormal(thisPoint, nextPoint);
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
      const normal = calcUnitNormal(previousPoint, thisPoint);
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

// Vector helper functions
// -----------------------
// TODO: Move these to a separate library
type Vec2 = [number, number];
function calcUnitNormal(a: Vec2, b: Vec2) {
  // dx=b[0]-a[0] and dy=b[1]-a[1], then the normals are (-dy, dx) and (dy, -dx).
  const normal: Vec2 = [a[1] - b[1], b[0] - a[0]];

  // Turn into unit
  return unit(normal);
}

function projectPoint(p: { coordinates: Vec2 }): Vec2 {
  const o = MercatorCoordinate.fromLngLat({
    lng: p.coordinates[0],
    lat: p.coordinates[1]
  });
  return [o.x, o.y];
}

/** Returns the cross product of vectors `a` and `b` */
function crossProduct(a: Vec2, b: Vec2) {
  return a[0] * b[1] - a[1] * b[0];
}

/** Subtracts vector `a` from vector `b` and returns the result. */
function subtract(a: Vec2, b: Vec2): Vec2 {
  return [b[0] - a[0], b[1] - a[1]];
}

function unit(v: Vec2): Vec2 {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  return [v[0] / length, v[1] / length];
}

/** Adds vector `a` to vector `b` and returns the result. */
function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}
function mult(v: Vec2, a: number): Vec2 {
  return [v[0] * a, v[1] * a];
}
/** Returns a vector equal in magnitude and of the opposite direction from
 *  vector `a`
 */
function opposite(a: Vec2): Vec2 {
  return [-a[0], -a[1]];
}

/** Limits value `a` to fall between `low` and `high` */
function clamp(a: number, low: number, high: number) {
  return Math.max(Math.min(a, high), low);
}
