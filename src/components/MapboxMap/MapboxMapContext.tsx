import React from "react";

export type MapboxMapContextType = {
  map: mapboxgl.Map | null;
  width: number;
  height: number;
};

const MapboxMapContext = React.createContext<MapboxMapContextType>({
  map: null,
  width: 0,
  height: 0
});

export default MapboxMapContext;
