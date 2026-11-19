import { useEffect, useId, useRef } from "react";
import { useToast } from "../context/ToastContext";
import type { ToastStatus } from "./beui/AnimatedToastStack";

/** The global stack survives route changes and rows disappearing after a save. */
export function ActionFeedback({ message, status = "success" }: { message: string; status?: ToastStatus }) {
  const { notify } = useToast();
  const id = useId();
  const previous = useRef("");
  useEffect(() => {
    const key = `${status}:${message}`;
    if (message && previous.current !== key) notify({ id, title: message, status });
    previous.current = key;
  }, [id, message, notify, status]);
  return null;
}
