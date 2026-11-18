import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
const getSnapshot = () => window.matchMedia(query).matches;
function subscribe(notify: () => void) {
  const preference = window.matchMedia(query);
  preference.addEventListener("change", notify);
  return () => preference.removeEventListener("change", notify);
}

// Keep interactive springs in sync when the OS preference changes mid-session.
export function useReducedMotionPreference() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
