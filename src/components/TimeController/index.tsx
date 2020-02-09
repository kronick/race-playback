import React, { useContext, useRef, useState } from "react";
import TimeContext from "../shared-contexts/TimeContext";
import classNames from "classnames";

import styles from "./TimeController.module.scss";
import useDraggable from "../shared-hooks/useDraggable";

const TimeController: React.FC<{}> = () => {
  const time = useContext(TimeContext);
  return (
    <div className={styles.TimeController}>
      {/* <div className={styles.PlayPause}>▶</div> */}
      {time.isPlaying ? (
        <div className={styles.PlayPause} onClick={() => time.pause()}>
          ❚❚
        </div>
      ) : (
        <div className={styles.PlayPause} onClick={() => time.play()}>
          ▶
        </div>
      )}
      <TimeBar />

      <div className={styles.CurrentTime}>{formatTime(time.currentTime)}</div>
    </div>
  );
};

const TimeBar: React.FC<{}> = () => {
  const time = useContext(TimeContext);
  const barRef = useRef<HTMLDivElement>(null);

  const [wasPlaying, setWasPlaying] = useState(time.isPlaying);

  // TODO: Because I can't figure out how to memoize this function properly,
  // the window event listener is added and removed on every render.
  // This doesn't seem to cause performance problems at the moment, but its
  // annoying and feels wrong.
  const setPosition: (
    ev: MouseEvent | React.MouseEvent<HTMLDivElement>
  ) => void = ev => {
    if (!barRef.current) return;

    const width = barRef.current?.getBoundingClientRect().width;
    if (!width) return;
    const position =
      (ev.clientX - barRef.current.getBoundingClientRect().left) / width;
    time.setCurrentTime(
      position * (time.endTime - time.startTime) + time.startTime
    );
    time.pause();
  };

  const onDragStart = () => {
    setDragging(true);
    // Capture whether the player was playing before we started dragging
    setWasPlaying(time.isPlaying);
  };
  const onDragEnd = () => {
    // Return the player to its previous state
    if (wasPlaying) time.play();
  };

  const [dragging, setDragging] = useDraggable(setPosition, onDragEnd);

  return (
    <div className={styles.TimeBar}>
      <div className={styles.TimeBarBackground} ref={barRef} />
      <div
        className={styles.TimeBarElapsed}
        style={{
          width: `${(time.currentTime / (time.endTime - time.startTime)) *
            100}%`
        }}
      />
      <div
        className={classNames(
          styles.TimeBarDot,
          dragging ? styles.isGrabbing : null
        )}
        onMouseDown={onDragStart}
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
