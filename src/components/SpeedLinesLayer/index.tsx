import React, { useContext, useEffect, useRef, useState } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import MapboxMapContext from "../MapboxMap/MapboxMapContext";
import { VesselData, PositionsArray } from "../../shared-types/race-data";
import { CustomLayerInterface, MercatorCoordinate } from "mapbox-gl";

import usePrefetch from "../shared-hooks/usePrefetch";
import { render } from "@testing-library/react";
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

    this.positions = [
      // [-122.46631622314455, 37.819548028632376],
      // [-122.45670318603516, 37.83148014503288],
      // [-122.44022369384766, 37.82280243352756],
      // [-122.43370056152344, 37.84720589601068],
      // [-122.42168426513672, 37.813310018173155],
      // [-122.4093246459961, 37.85045908105493],
      // [-122.40348815917969, 37.815751041563544],
      // [-122.39696502685547, 37.837174338616975],
      // [-122.38975524902342, 37.864825598046316],
      // [-122.3818588256836, 37.81222509298159],
      // [-122.37155914306639, 37.846392577323286],
      // [-122.35954284667967, 37.88433788984125],
      // [-122.3488998413086, 37.84476591303736],
      // [-122.3444366455078, 37.82578551195746]
      // -----------
      // [-122.40966796874999, 37.84381700896712],
      // [-122.39078521728516, 37.84178360198902],
      // [-122.37413406372069, 37.86021777498129],
      // [-122.38838195800781, 37.87715688349197],
      // [-122.40795135498047, 37.87119476142242],
      // [-122.41893768310548, 37.87959579435171],
      // [-122.41670608520508, 37.89219554724437],
      // [-122.3961067199707, 37.89842688615329],
      // [-122.37585067749023, 37.895988598965644],
      // [-122.35937118530273, 37.88867325279477],
      // [-122.35301971435545, 37.87891832721349],
      // [-122.35610961914062, 37.872549831535984],
      // [-122.35628128051756, 37.86170857279247],
      // [-122.34975814819335, 37.856693951195375],
      // [-122.34048843383788, 37.85574520062395],
      // [-122.33396530151366, 37.85750715625203],
      // [-122.32589721679688, 37.85560966383123],
      // [-122.32589721679688, 37.84937470198794],
      // [-122.33671188354494, 37.841512476822736],
      // [-122.35130310058594, 37.83053107003994],
      // [-122.34769821166991, 37.82551432799189],
      // [-122.3356819152832, 37.82578551195746],
      // [-122.32830047607422, 37.832293628167335],
      // [-122.32418060302733, 37.827005827470515],
      // [-122.31473922729492, 37.84951025024348]

      [-122.40777969360353, 37.853305500228025],
      [-122.3997116088867, 37.8928728922426],
      [-122.39301681518555, 37.84422368363511],
      [-122.37894058227539, 37.88962157941565],
      [-122.35765457153319, 37.84435924135944],
      [-122.34992980957031, 37.88108620012162],
      [-122.34169006347656, 37.884608857503785],
      [-122.33053207397461, 37.88325400922058],
      [-122.32589721679688, 37.87376937332855],
      [-122.32812881469725, 37.865232156838225],
      [-122.33430862426758, 37.858455884146096],
      [-122.33722686767577, 37.85181453246186],
      [-122.33345031738283, 37.84598591461569],
      [-122.3276138305664, 37.84246141054429],
      [-122.3279571533203, 37.83337825839438],
      [-122.33293533325195, 37.829175227444345],
      [-122.34237670898438, 37.82673464798931],
      [-122.35439300537108, 37.828361709928295],
      [-122.36005783081055, 37.83324268048803],
      [-122.36400604248047, 37.828361709928295],
      [-122.37138748168944, 37.84408812566162]
    ].map((c, i) => ({
      coordinates: c as [number, number],
      timestamp: i * 4,
      heading: 0
    }));

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
    if (!this.program) return;

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program, "u_matrix"),
      false,
      matrix
    );

    gl.uniform1f(
      gl.getUniformLocation(this.program, "u_width"),
      0.0000002 //0.000001 * (Math.cos(performance.now() / 500) + 1.5)
    );

    gl.uniform1f(gl.getUniformLocation(this.program, "u_time"), this.time);

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
      const A = dP(previousPoint, thisPoint);
      const B = dP(thisPoint, nextPoint);
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
      const miterLength = cosHalfAngle !== 0 ? 1 / cosHalfAngle : Infinity;

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

function calcUnitNormal(a: [number, number], b: [number, number]) {
  // dx=b[0]-a[0] and dy=b[1]-a[1], then the normals are (-dy, dx) and (dy, -dx).
  const normal: [number, number] = [a[1] - b[1], b[0] - a[0]];

  // Turn into unit
  return unit(normal);
}

function projectPoint(p: { coordinates: [number, number] }): [number, number] {
  const o = MercatorCoordinate.fromLngLat({
    lng: p.coordinates[0],
    lat: p.coordinates[1]
  });
  return [o.x, o.y];
}

function crossProduct(a: [number, number], b: [number, number]) {
  return a[0] * b[1] - a[1] * b[0];
}

function dP(a: [number, number], b: [number, number]): [number, number] {
  return [b[0] - a[0], b[1] - a[1]];
}

function unit(v: [number, number]): [number, number] {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  return [v[0] / length, v[1] / length];
}

function add(a: [number, number], b: [number, number]): [number, number] {
  return [a[0] + b[0], a[1] + b[1]];
}
function mult(v: [number, number], a: number): [number, number] {
  return [v[0] * a, v[1] * a];
}
function opposite(a: [number, number]): [number, number] {
  return [-a[0], -a[1]];
}
