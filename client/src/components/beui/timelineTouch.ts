// Pointer capture can fail if the browser has already claimed a touch gesture.
export const TOUCH_GESTURE_CLASS = "select-none [-webkit-touch-callout:none]";

export function capturePointer(element: Element, pointerId: number) {
  try { element.setPointerCapture(pointerId); } catch { /* Native scrolling may own it. */ }
}

export function releasePointer(element: Element, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
  } catch { /* A cancelled pointer may already have released capture. */ }
}
