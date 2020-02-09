import { useState, useEffect, useRef } from "react";

export default function useAnimationTimer(
  onFrame: (dT: number) => void,
  framerate: number = 60
) {
  const [lastUpdated, setLastUpdated] = useState(performance.now());

  const [isPaused, setIsPaused] = useState(false);

  const timeout = useRef(0);

  useEffect(() => {
    const nextFrame = () => {
      // Don't do anything if the time is paused
      if (isPaused) return;

      const dT = performance.now() - lastUpdated;

      // Call the provided callback with an accurate measure of how much time
      // has elapsed since the last frame
      onFrame(dT / 1000);

      setLastUpdated(performance.now());

      timeout.current = window.setTimeout(nextFrame, 1000 / framerate);
    };

    timeout.current = window.setTimeout(nextFrame, 1000 / framerate);

    // Clean up timer whenever this component unmounts or the effect runss
    return () => {
      window.clearTimeout(timeout.current);
    };

    // const timer = window.setInterval(() => {
    //   const dT = performance.now() - lastUpdated;

    //   // Call the provided callback with an accurate measure of how much time
    //   // has elapsed since the last frame
    //   onFrame(dT);

    //   setLastUpdated(performance.now());
    // }, 1000 / framerate);

    // // Clean up timer whenever this component unmounts or the effect runss
    // return () => {
    //   window.clearInterval(timer);
    // };
  }, [framerate, onFrame, lastUpdated, isPaused]);

  const pause = () => {
    setIsPaused(true);
  };
  const play = () => {
    setLastUpdated(performance.now());
    setIsPaused(false);
  };

  return { play, pause, isPlaying: !isPaused };
}
