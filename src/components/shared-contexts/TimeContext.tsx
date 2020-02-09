import React from "react";

export type TimeContextType = {
  currentTime: number;
  startTime: number;
  endTime: number;
  setCurrentTime: (t: number) => void;
};

const TimeContext = React.createContext<TimeContextType>({
  currentTime: 0,
  startTime: 0,
  endTime: 0,
  setCurrentTime: () => null
});

export default TimeContext;
