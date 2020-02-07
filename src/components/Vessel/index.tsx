import React, { useContext, useEffect } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import MapboxMapContext from "../MapboxMap/MapboxMapContext";
import { VesselData } from "../../shared-types/race-data";

type VesselProps = {
  data: VesselData;
};
const Vessel: React.FC<VesselProps> = ({ data }) => {
  const time = useContext(TimeContext);
  const { map } = useContext(MapboxMapContext);

  // Add path line to Mapbox map
  useEffect(() => {
    if (map != null) {
      const id = `${data.name}-path`;

      // Clean up any previous sources and layers
      if (map.getSource(id)) {
        map.removeSource(id);
      }
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }

      map.addSource(id, { type: "geojson", data: data.path });
      map.addLayer({
        id,
        type: "line",
        source: id,
        paint: {
          "line-color": "#00FF00",
          "line-width": 2
        }
      });
    }
  }, [map, data.path, data.name]);

  // No DOM output from this component
  return null;
};

export default Vessel;
