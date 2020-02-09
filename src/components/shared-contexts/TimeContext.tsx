import React from "react";

export type TimeContextType = {
  currentTime: number;
  startTime: number;
  endTime: number;
  setCurrentTime: (t: number) => void;
  pause: () => void;
  play: () => void;
  isPlaying: boolean;
};

const TimeContext = React.createContext<TimeContextType>({
  currentTime: 0,
  startTime: 0,
  endTime: 0,
  setCurrentTime: () => null,
  pause: () => null,
  play: () => null,
  isPlaying: false
});

export default TimeContext;
