import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import Helmet from "react-helmet";

import MapboxMapContext, { MapboxMapTransform } from "./MapboxMapContext";

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
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  // Store map transform data in state so we can pass it to children
  const [transform, setTransform] = useState<MapboxMapTransform | null>(null);

  // Create a new Mapbox map instance whenver token prop changes
  useEffect(() => {
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainer.current ?? "",
      style: styleUrl
    });

    map.on("load", () => setMap(map));

    map.on("render", () => {
      const center = map.getCenter();
      setTransform({
        zoom: map.getZoom(),
        center: [center.lng, center.lat],
        bearing: map.getBearing(),
        pitch: map.getPitch()
      });
    });

    return () => {
      map.remove();
    };
  }, [token, styleUrl]);

  return (
    <>
      <Helmet>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v1.7.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </Helmet>
      <div style={{ width, height, overflow: "hidden" }}>
        <div
          ref={mapContainer}
          style={{ position: "absolute", width, height }}
        />
        <MapboxMapContext.Provider
          value={{ map, width: 0, height: 0, transform }}
        >
          {children}
        </MapboxMapContext.Provider>
      </div>
    </>
  );
};

export default MapboxMap;
