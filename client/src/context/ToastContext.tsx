import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { AnimatedToastStack, useAnimatedToastStack, type ToastInput } from "../components/beui/AnimatedToastStack";

type ToastContextValue = {
  notify: (input: ToastInput) => string;
  dismiss: (id: string) => void;
};
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, showToast, dismissToast, pauseToasts, resumeToasts } = useAnimatedToastStack({ defaultDuration: 6000, limit: 4 });
  const notify = useCallback((input: ToastInput) => showToast({
    duration: input.status === "error" || input.status === "loading" ? 0 : 6000,
    ...input,
  }), [showToast]);
  const value = useMemo(() => ({ notify, dismiss: dismissToast }), [notify, dismissToast]);
  return <ToastContext.Provider value={value}>
    {children}
    <AnimatedToastStack toasts={toasts} onDismiss={dismissToast} onPause={pauseToasts} onResume={resumeToasts}
      placement="fixed" position="top-right" maxVisible={4} />
  </ToastContext.Provider>;
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
