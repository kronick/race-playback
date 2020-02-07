import React from "react";

export type TimeContextType = {
  currentTime: number;
  setCurrentTime: (t: number) => void;
};

const TimeContext = React.createContext<TimeContextType>({
  currentTime: 0,
  setCurrentTime: () => null
});

export default TimeContext;
