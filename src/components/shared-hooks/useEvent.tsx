import { useEffect } from "react";

export default function useEvent<K extends keyof WindowEventMap>(
  event: K,
  handler: (this: Window, ev: WindowEventMap[K]) => any,
  options: boolean | AddEventListenerOptions = false,
  deps?: React.DependencyList
) {
  useEffect(() => {
    // initiate the event handler
    window.addEventListener(event, handler, options);

    // this will clean up the event every time the component is re-rendered
    return function cleanup() {
      window.removeEventListener(event, handler);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
