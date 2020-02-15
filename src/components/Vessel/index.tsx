import React, { useContext, useCallback } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import MapboxMapContext from "../MapboxMap/MapboxMapContext";
import { VesselData } from "../../shared-types/race-data";

import { interpolatePosition } from "../../utilities/vessel-data";

import styles from "./Vessel.module.scss";

type VesselProps = {
  data: VesselData;
  trace?: boolean;
};
const Vessel: React.FC<VesselProps> = ({ data, trace = false }) => {
  const time = useContext(TimeContext);
  const { map, transform } = useContext(MapboxMapContext);

  const currentPosition = interpolatePosition(time.currentTime, data.positions);

  // Forward scroll events to the Mapbox map
  const scrollHandler = useCallback(
    (ev: React.WheelEvent<HTMLDivElement>) => {
      map
        ?.getCanvas()
        .dispatchEvent(new WheelEvent(ev.nativeEvent.type, ev.nativeEvent));
    },
    [map]
  );

  if (map !== null && currentPosition && transform) {
    // Figure out placement and scaling of vessel marker based on map transform
    const projected = map.project(currentPosition.coordinates);

    const rotation = currentPosition.heading - transform.bearing;
    const pitch = transform.pitch;

    const scaleFactor = Math.min(Math.max((transform.zoom - 10) / 5, 0.5), 2);

    const width = 20;
    const height = 30;

    return (
      <div
        style={{
          position: "absolute",
          transform: `translate(${projected.x}px,  ${projected.y}px)
          rotateX(${pitch}deg) rotateZ(${rotation}deg) scale(${scaleFactor})`
        }}
        onWheel={scrollHandler}
      >
        <div
          className={styles.Vessel}
          style={{
            borderColor: `transparent transparent #aaa transparent`,
            borderWidth: `0 ${width / 2}px ${height}px ${width / 2}px`,
            position: "absolute",
            transform: `translate(-50%, -50%)`
          }}
        ></div>
      </div>
    );
  } else {
    return null;
  }
};

export default Vessel;
