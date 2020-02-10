import React, { useContext, useEffect, useRef, useState } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import MapboxMapContext from "../MapboxMap/MapboxMapContext";
import { VesselData } from "../../shared-types/race-data";
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
  const { map } = useContext(MapboxMapContext);

  const { data: fragmentSource, status: fragmentSourceStatus } = usePrefetch(
    process.env.PUBLIC_URL + "/shaders/speed-lines.frag"
  );
  const { data: vertexSource, status: vertexSourceStatus } = usePrefetch(
    process.env.PUBLIC_URL + "/shaders/speed-lines.vert"
  );

  const [renderer, setRenderer] = useState<SpeedLinesLayer | null>(null);

  const [initialized, setInitialized] = useState(false);

  //process.env.PUBLIC_URL + '/img/logo.png'

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

  constructor(id: string, fragmentShader: string, vertexShader: string) {
    this.id = id;
    this.fragmentSource = fragmentShader;
    this.vertexSource = vertexShader;
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
    this.initializeShaders(gl);

    this.aPos = gl.getAttribLocation(this.program!, "a_pos");

    // define vertices of the triangle to be rendered in the custom style layer
    const pointA = MercatorCoordinate.fromLngLat({
      lng: -122.40520477294922,
      lat: 37.90411590881245
    });
    const pointB = MercatorCoordinate.fromLngLat({
      lng: -122.4481201171875,
      lat: 37.82090404811055
    });
    const pointC = MercatorCoordinate.fromLngLat({
      lng: -122.33001708984374,
      lat: 37.838801170343544
    });

    // create and initialize a WebGLBuffer to store vertex and color data
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        pointA.x,
        pointA.y,
        pointB.x,
        pointB.y,
        pointC.x,
        pointC.y
      ]),
      gl.STATIC_DRAW
    );
  }

  render(gl: WebGLRenderingContext, matrix: number[]) {
    if (!this.program) return;

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program, "u_matrix"),
      false,
      matrix
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
  }
}
