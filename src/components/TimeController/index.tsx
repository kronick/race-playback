import React, { useContext } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import classnames from "classnames";

import styles from "./TimeController.module.scss";

const TimeController: React.FC<{}> = () => {
  const time = useContext(TimeContext);
  return (
    <div className={styles.TimeController}>
      {/* <div className={styles.PlayPause}>▶</div> */}
      <div className={styles.PlayPause}>❚❚</div>
      <TimeBar />

      <div className={styles.CurrentTime}>{formatTime(time.currentTime)}</div>
    </div>
  );
};

const TimeBar: React.FC<{}> = () => {
  const time = useContext(TimeContext);
  return (
    <div className={styles.TimeBar}>
      <div className={styles.TimeBarBackground} />
      <div
        className={styles.TimeBarElapsed}
        style={{
          width: `${(time.currentTime / (time.endTime - time.startTime)) *
            100}%`
        }}
      />
      <div
        className={styles.TimeBarDot}
        style={{
          left: `${(time.currentTime / (time.endTime - time.startTime)) * 100}%`
        }}
      />
    </div>
  );
};

const formatTime = (m: number): string => {
  const hourFactor = 60;

  let remaining = m;
  const hours = Math.floor(remaining / hourFactor);
  remaining -= hours * hourFactor;

  const minutes = Math.floor(remaining);
  const seconds = Math.round((remaining - minutes) * 60);

  return `t+${lpad(hours)}h:${lpad(minutes)}m:${lpad(seconds)}s`;
};

const lpad = (n: number, d: number = 2) => {
  let str = n.toString();
  while (str.length < d) {
    str = `0${str}`;
  }
  return str;
};

export default TimeController;
