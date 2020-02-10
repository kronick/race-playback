import { useEffect, useState } from "react";

/** Limits the frequency with which an effect can be called */
export default function useThrottledEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList,
  minimumPeriodInMilliseconds: number = 1000
) {
  const [lastTime, setLastTime] = useState(performance.now());

  useEffect(
    () => {
      const dT = performance.now() - lastTime;
      if (dT >= minimumPeriodInMilliseconds) {
        effect();
        setLastTime(performance.now());
      }
    },
    deps ? [minimumPeriodInMilliseconds, effect, ...deps] : undefined
  );
}
