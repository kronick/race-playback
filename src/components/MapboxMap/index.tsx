import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import Helmet from "react-helmet";

import MapboxMapContext from "./MapboxMapContext";

type MapboxMapProps = {
  token: string;
  styleUrl: string;
  width: string;
  height: string;
};

const MapboxMap: React.FC<MapboxMapProps> = ({
  token,
  styleUrl,
  width,
  height,
  children
}) => {
  let mapContainer = useRef<HTMLDivElement>(null);

  // Store the current Mapbox map instance in component state
  const [map, setMap] = useState<mapboxgl.Map | null>(() => null);

  // Create a new Mapbox map instance whenver token prop changes
  useEffect(() => {
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainer.current ?? "",
      style: styleUrl
    });
    map.on("load", () => setMap(map));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Helmet>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v1.7.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </Helmet>
      <div ref={mapContainer} style={{ width, height }}>
        <MapboxMapContext.Provider value={{ map, width: 0, height: 0 }}>
          {children}
        </MapboxMapContext.Provider>
      </div>
    </>
  );
};

export default MapboxMap;
