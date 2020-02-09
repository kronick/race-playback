import React, { useContext, useEffect } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import MapboxMapContext from "../MapboxMap/MapboxMapContext";
import { VesselData } from "../../shared-types/race-data";

import { interpolatePosition } from "../../utilities/vessel-data";

type VesselProps = {
  data: VesselData;
};
const Vessel: React.FC<VesselProps> = ({ data }) => {
  const time = useContext(TimeContext);
  const { map } = useContext(MapboxMapContext);

  // Add path line to Mapbox map
  useEffect(() => {
    if (map != null) {
      const pathID = `${data.name}-path`;

      // Clean up any previous sources and layers
      if (map.getSource(pathID)) {
        map.removeSource(pathID);
      }
      if (map.getLayer(pathID)) {
        map.removeLayer(pathID);
      }

      map.addSource(pathID, { type: "geojson", data: data.path });
      map.addLayer({
        id: pathID,
        type: "line",
        source: pathID,
        paint: {
          "line-color": "#A8BFBD",
          "line-opacity": 0.5,
          "line-width": 2
        }
      });
    }
  }, [map, data.path, data.name]);

  const currentPosition = interpolatePosition(time.currentTime, data.positions);
  if (map !== null && currentPosition) {
    const projected = map.project(currentPosition);
    return (
      <div
        style={{
          color: "#2B2B2B",
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
