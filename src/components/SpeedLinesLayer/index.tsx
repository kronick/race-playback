import React, { useContext, useEffect, useRef, useState } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import MapboxMapContext from "../MapboxMap/MapboxMapContext";
import { VesselData, PositionsArray } from "../../shared-types/race-data";
import { CustomLayerInterface } from "mapbox-gl";

import usePrefetch from "../shared-hooks/usePrefetch";
import generateLineArray from "./generate-line-array";
//const vertexSource = raw("./shaders/speed-lines.vert");
//const fragmentSource = raw("./shaders/speed-lines.frag");

type SpeedLinesLayerProps = {
  vessels: VesselData[];
};
const SpeedLinesLayerComponent: React.FC<SpeedLinesLayerProps> = ({
  vessels
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
        vessels.map(v => v.positions),
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
  aSpeed: number = 0;
  buffer: WebGLBuffer | null = null;

  fragmentSource: string;
  vertexSource: string;

  positions: PositionsArray[];
  traceLengths: number[] = [];
  nVertices: number = 0;

  /** Length of trail behind each point (in same unit as input timestamps) */
  trailLength = 60;
  lineWidth = 0.004;

  time: number = 0;
  map: mapboxgl.Map | null = null;

  static floatsPerVertex = 6;

  constructor(
    id: string,
    positions: PositionsArray[],
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
    this.aSpeed = gl.getAttribLocation(this.program!, "a_speed");

    // create and initialize a WebGLBuffer to store vertex and color data
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    const data: number[] = [];
    this.traceLengths = [];
    this.positions.forEach(p => {
      const newPoints = generateLineArray(p);
      this.traceLengths.push(
        newPoints.length / SpeedLinesLayer.floatsPerVertex
      );
      data.push(...newPoints);
    });
    //const data = this.positions.flatMap(p => generateLineArray(p));
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

    gl.useProgram(this.program);
    gl.uniform1i(gl.getUniformLocation(this.program, "u_persist_trace"), 1);

    gl.uniform1f(
      gl.getUniformLocation(this.program, "u_width"),
      this.lineWidth //0.000001 * (Math.cos(performance.now() / 500) + 1.5)
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

    this.setupBuffers(gl);

    // All traces are concatenated into a single vertex buffer for efficiency.
    // `this.traceLengths` stores the length of each trace so we can call
    // `gl.drawArrays()` once per trace and get a clean separation.
    // We could also change uniforms or even shaders between each  trace, but
    // for now we don't. This just keeps the traces visually separate.
    let drawn = 0;
    this.traceLengths.forEach(l => {
      gl.drawArrays(gl.TRIANGLE_STRIP, drawn, l);
      drawn += l;
    });
  }

  setupBuffers(gl: WebGLRenderingContext) {
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

    gl.enableVertexAttribArray(this.aSpeed);
    gl.vertexAttribPointer(
      this.aSpeed,
      1,
      gl.FLOAT,
      false,
      SpeedLinesLayer.floatsPerVertex * 4, // 4 bytes per float
      20
    );

    gl.enable(gl.BLEND);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Flat
    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA); // Glowy
  }

  drawTrace(gl: WebGLRenderingContext, offset: number, nPoints: number) {
    //gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.nVertices);
  }
}
