import { useState } from "react";
import useEvent from "./useEvent";

type GeneralizedMouseEvent =
  | MouseEvent
  | React.MouseEvent<HTMLDivElement, MouseEvent>;
export default function useDraggable(
  onDrag: (ev: GeneralizedMouseEvent) => void,
  onRelease?: (ev: GeneralizedMouseEvent) => void
) {
  const [dragging, setDragging] = useState(false);
  const [oldCursor, setOldCursor] = useState("pointer");

  // Register global event handlers so the drag doesn't have to stay within
  // this component's bounds
  useEvent(
    "mouseup",
    ev => {
      if (dragging) {
        setDragging(false);
        onRelease?.(ev);
        document.body.style.cursor = oldCursor;
      }
    },
    false,
    [onDrag, onRelease, oldCursor]
  );
  useEvent(
    "mousemove",
    ev => {
      if (dragging) {
        onDrag(ev);
        document.body.style.cursor = "grabbing";
      } else {
        setOldCursor(document.body.style.cursor);
      }
    },
    false,
    [onDrag]
  );

  return [dragging, setDragging] as const;
}
