import React, { useContext, useEffect } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import MapboxMapContext from "../MapboxMap/MapboxMapContext";
import { VesselData } from "../../shared-types/race-data";

import { GeoJSON } from "../../shared-types/geojson";
import { GeoJSONSource } from "mapbox-gl";
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
          "line-color": "#00FF00",
          "line-width": 2
        }
      });
    }
  }, [map, data.path, data.name]);

  const markerID = `${data.name}-marker`;

  // // Add marker point to the Mapbox map
  // useEffect(() => {
  //   if (map != null) {
  //     // Clean up any previous sources and layers
  //     if (map.getSource(markerID)) {
  //       map.removeSource(markerID);
  //     }
  //     if (map.getLayer(markerID)) {
  //       map.removeLayer(markerID);
  //     }

  //     map.addSource(markerID, {
  //       type: "geojson",
  //       data: coord2Feature(data.positions[0].coordinates)
  //     });
  //     map.addLayer({
  //       id: markerID,
  //       type: "circle",
  //       source: markerID,
  //       paint: {
  //         "circle-color": "#0000FF",
  //         "circle-radius": 5
  //       }
  //     });
  //   }
  // }, [map, data.positions, data.name]);

  // // Update marker point
  // useEffect(() => {
  //   if (map !== null) {
  //     const currentPosition = interpolatePosition(
  //       time.currentTime,
  //       data.positions
  //     );
  //     if (currentPosition) {
  //       (map.getSource(markerID) as GeoJSONSource).setData(
  //         coord2Feature(currentPosition)
  //       );
  //     } else {
  //       (map.getSource(markerID) as GeoJSONSource).setData(
  //         coord2Feature([0, 0])
  //       );
  //     }
  //   }
  // }, [map, time.currentTime]);
  //
  // return null;

  const currentPosition = interpolatePosition(time.currentTime, data.positions);
  if (map !== null && currentPosition) {
    const projected = map.project(currentPosition);
    return (
      <div
        style={{
          fontSize: "30px",
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

const coord2Feature = (coord: number[]): GeoJSON.PointFeature => {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Point", coordinates: coord }
  };
};

export default Vessel;
