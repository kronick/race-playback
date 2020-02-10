import React, { useContext, useEffect, useRef } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import MapboxMapContext from "../MapboxMap/MapboxMapContext";
import { VesselData } from "../../shared-types/race-data";

import { interpolatePosition } from "../../utilities/vessel-data";
import useThrottledEffect from "../shared-hooks/useThrottledEffect";

type VesselProps = {
  data: VesselData;
  trace?: boolean;
};
const Vessel: React.FC<VesselProps> = ({ data, trace = false }) => {
  const time = useContext(TimeContext);
  const { map } = useContext(MapboxMapContext);

  const pathID = `${data.name}-path`;

  // Add path line to Mapbox map
  useEffect(() => {
    if (map != null) {
      // Clean up any previous sources and layers
      if (map.getSource(pathID)) {
        map.removeSource(pathID);
      }
      if (map.getLayer(pathID)) {
        map.removeLayer(pathID);
      }

      // map.addSource(pathID, { type: "geojson", data: data.path });
      map.addSource(pathID, { type: "geojson", data: data.pathWithSpeeds });

      map.addLayer({
        id: pathID,
        type: "line",
        source: pathID,
        paint: {
          "line-color": [
            "interpolate",
            ["linear"],
            ["get", "speed"],
            0,
            "#003f5c",
            2.5,
            "#58508d",
            5,
            "#bc5090",
            7.5,
            "#ff6361",
            10,
            "#ffa600"
          ],
          "line-opacity": 1,
          "line-width-transition": { duration: 1000, delay: 0 },
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            8,
            0.5,
            16,
            1
          ]
        },
        layout: {
          "line-cap": "round"
        }
      });
    }
  }, [map, data.pathWithSpeeds, pathID]);

  // Update opacity based on time
  useThrottledEffect(
    () => {
      if (map !== null) {
        if (trace) {
          map.setPaintProperty(pathID, "line-width", [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            8,
            ["case", [">=", ["get", "timestamp"], time.currentTime], 0.5, 2],
            16,
            ["case", [">=", ["get", "timestamp"], time.currentTime], 1, 16]
          ]);
        }
      }
    },
    [time.currentTime, map, pathID, trace],
    100
  );

  const currentPosition = interpolatePosition(time.currentTime, data.positions);
  if (map !== null && currentPosition) {
    const projected = map.project(currentPosition);
    return (
      <div
        style={{
          color: "#aaa",
          fontSize: "50px",
          position: "absolute",
          transform: `translate(-50%, -50%) translate(${projected.x}px,  ${projected.y}px)`
        }}
      >
        •
      </div>
    );
  } else {
    return null;
  }
};

export default Vessel;
