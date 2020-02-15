import React from "react";

export type MapboxMapContextType = {
  map: mapboxgl.Map | null;
  width: number;
  height: number;

  transform: MapboxMapTransform | null;
};

export type MapboxMapTransform = {
  zoom: number;
  center: [number, number];
  bearing: number;
  pitch: number;
};

const MapboxMapContext = React.createContext<MapboxMapContextType>({
  map: null,
  width: 0,
  height: 0,
  transform: null
});

export default MapboxMapContext;
