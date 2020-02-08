import React, { useContext } from "react";
import TimeContext from "../shared-contexts/TimeContext";

import styles from "./TimeController.module.scss";

const TimeController: React.FC<{}> = () => {
  const time = useContext(TimeContext);
  return (
    <div className={styles.TimeController}>
      <div className={styles.CurrentTime}>{formatTime(time.currentTime)}</div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const minuteFactor = 60;
  const hourFactor = minuteFactor * 60;

  let remaining = seconds;
  const hours = Math.floor(remaining / hourFactor);
  remaining -= hours * hourFactor;

  const minutes = Math.floor(remaining / minuteFactor);
  remaining -= minutes * minuteFactor;

  return `${lpad(hours)}h:${lpad(minutes)}m:${lpad(remaining)}s`;
};

const lpad = (n: number, d: number = 2) => {
  let str = n.toString();
  while (str.length < d) {
    str = `0${str}`;
  }
  return str;
};

export default TimeController;
