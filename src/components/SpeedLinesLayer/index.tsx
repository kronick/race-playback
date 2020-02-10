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
  buffer: WebGLBuffer | null = null;

  fragmentSource: string;
  vertexSource: string;

  positions: PositionsArray;
  nVertices: number = 0;

  time: number = 0;
  map: mapboxgl.Map | null = null;

  static floatsPerVertex = 3;

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

    gl.uniform2fv(gl.getUniformLocation(this.program, "u_offset"), [
      // 0.00001 * Math.cos(performance.now() / 50),
      // 0.00001 * Math.sin(performance.now() / 50)
      0,
      0
    ]);

    gl.uniform1f(gl.getUniformLocation(this.program, "u_time"), this.time);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(
      this.aPos,
      3,
      gl.FLOAT,
      false,
      SpeedLinesLayer.floatsPerVertex * 4, // 4 bytes per float
      0
    );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.nVertices);
  }
}

function generateLineArray(positions: PositionsArray): number[] {
  return positions.flatMap(p => {
    const asPoint = MercatorCoordinate.fromLngLat({
      lng: p.coordinates[0],
      lat: p.coordinates[1]
    });
    return [asPoint.x, asPoint.y, p.timestamp];
  });
}
