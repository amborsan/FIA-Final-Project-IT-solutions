"use client";
// beui.dev/components/motion/animated-toast-stack

import {
  AlertCircle,
  Bell,
  Check,
  Info,
  LoaderCircle,
  type LucideIcon,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { EASE_OUT } from "./ease";

import { cn } from "@/lib/utils";
import { useI18n } from "../../i18n/I18nContext";

export type ToastStatus = "neutral" | "info" | "loading" | "success" | "error";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type AnimatedToastAction = {
  label: ReactNode;
  onClick: (toast: AnimatedToast) => void;
};

export type AnimatedToast = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  status?: ToastStatus;
  icon?: ReactNode;
  action?: AnimatedToastAction;
  duration?: number;
  dismissible?: boolean;
  createdAt?: number;
};

export type ToastInput = Omit<AnimatedToast, "id" | "createdAt"> & {
  id?: string;
};

export type ToastClassNames = {
  root?: string;
  item?: string;
  surface?: string;
  iconWrap?: string;
  content?: string;
  title?: string;
  description?: string;
  action?: string;
  close?: string;
  progress?: string;
};

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const animatedToastStackMessages = {
  dismiss: "Dismiss toast",
};

export type AnimatedToastStackMessages = typeof animatedToastStackMessages;

export interface AnimatedToastStackProps {
  toasts: AnimatedToast[];
  onDismiss?: (id: string) => void;
  position?: ToastPosition;
  placement?: "static" | "fixed" | "absolute";
  fixed?: boolean;
  portal?: boolean;
  portalRoot?: Element | null;
  maxVisible?: number;
  className?: string;
  classNames?: ToastClassNames;
  icons?: Partial<Record<ToastStatus, ReactNode>>;
  renderToast?: (toast: AnimatedToast) => ReactNode;
  /** Override any built-in string. */
  labels?: Partial<AnimatedToastStackMessages>;
  onPause?: () => void;
  onResume?: () => void;
}

export interface UseAnimatedToastStackOptions {
  initialToasts?: ToastInput[];
  defaultDuration?: number;
  limit?: number;
}

const STACK_SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.75,
};

const CONTENT_TRANSITION = {
  duration: 0.28,
  ease: EASE_OUT,
} as const;

const STATUS_ICON: Record<ToastStatus, LucideIcon> = {
  neutral: Bell,
  info: Info,
  loading: LoaderCircle,
  success: Check,
  error: AlertCircle,
};

const STATUS_CLASS: Record<ToastStatus, string> = {
  neutral: "text-muted-foreground bg-muted/60",
  info: "text-primary bg-muted",
  loading: "text-primary bg-muted",
  success: "text-success bg-success/10",
  error: "text-destructive bg-destructive/10",
};

const POSITION_CLASS: Record<ToastPosition, string> = {
  "top-left": "left-4 top-4",
  "top-center": "left-1/2 top-4 -translate-x-1/2",
  "top-right": "right-4 top-[var(--toast-top)]",
  "bottom-left": "bottom-6 left-4",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-6 right-4",
};

let idSeed = 0;

function createToast(input: ToastInput, defaultDuration: number): AnimatedToast {
  return {
    duration: defaultDuration,
    dismissible: true,
    ...input,
    id: input.id ?? `toast-${Date.now()}-${idSeed++}`,
    createdAt: Date.now(),
  };
}

export function useAnimatedToastStack({
  initialToasts = [],
  defaultDuration = 4200,
  limit,
}: UseAnimatedToastStackOptions = {}) {
  const toastTimers = useRef<Map<string, { timer: number; signature: string }>>(new Map());
  const [toasts, setToasts] = useState<AnimatedToast[]>(() =>
    initialToasts.map((toast) => createToast(toast, defaultDuration)),
  );
  const [paused, setPaused] = useState(false);
  const pausedAt = useRef<number | null>(null);
  const pauseToasts = useCallback(() => { if (pausedAt.current === null) { pausedAt.current = Date.now(); setPaused(true); } }, []);
  const resumeToasts = useCallback(() => {
    if (pausedAt.current === null) return;
    const start = pausedAt.current;
    const now = Date.now();
    pausedAt.current = null;
    setToasts(current => current.map(toast => ({ ...toast, createdAt: (toast.createdAt ?? start) + now - Math.max(start, toast.createdAt ?? start) })));
    setPaused(false);
  }, []);


  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (input: ToastInput) => {
      const toast = createToast(input, defaultDuration);
      setToasts((current) => {
        const next = [...current.filter(item => item.id !== toast.id), toast];
        return typeof limit === "number" ? next.slice(-limit) : next;
      });
      return toast.id;
    },
    [defaultDuration, limit],
  );

  const updateToast = useCallback((id: string, patch: Partial<ToastInput>) => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id
          ? {
              ...toast,
              ...patch,
              id,
              createdAt: patch.duration === undefined ? toast.createdAt : Date.now(),
            }
          : toast,
      ),
    );
  }, []);

  useEffect(() => {
    if (paused) {
      toastTimers.current.forEach(entry => window.clearTimeout(entry.timer));
      toastTimers.current.clear();
      return;
    }
    const activeIds = new Set(toasts.map((toast) => toast.id));

    toastTimers.current.forEach((entry, id) => {
      if (!activeIds.has(id)) {
        window.clearTimeout(entry.timer);
        toastTimers.current.delete(id);
      }
    });

    toasts.forEach((toast) => {
      const duration = toast.duration ?? defaultDuration;
      const existing = toastTimers.current.get(toast.id);

      if (duration <= 0) {
        if (existing) {
          window.clearTimeout(existing.timer);
          toastTimers.current.delete(toast.id);
        }
        return;
      }

      const createdAt = toast.createdAt ?? Date.now();
      const signature = `${createdAt}:${duration}`;

      if (existing?.signature === signature) {
        return;
      }

      if (existing) {
        window.clearTimeout(existing.timer);
      }

      const elapsed = Date.now() - createdAt;
      const remaining = Math.max(duration - elapsed, 0);
      const timer = window.setTimeout(() => {
        toastTimers.current.delete(toast.id);
        dismissToast(toast.id);
      }, remaining);

      toastTimers.current.set(toast.id, { timer, signature });
    });
  }, [defaultDuration, dismissToast, toasts, paused]);

  useEffect(() => {
    const timers = toastTimers.current;

    return () => {
      timers.forEach((entry) => {
        window.clearTimeout(entry.timer);
      });
      timers.clear();
    };
  }, []);

  return useMemo(
    () => ({
      toasts,
      pauseToasts,
      resumeToasts,
      showToast,
      updateToast,
      dismissToast,
      clearToasts,
      setToasts,
    }),
    [clearToasts, dismissToast, showToast, toasts, updateToast, pauseToasts, resumeToasts],
  );
}

export function AnimatedToastStack({
  toasts,
  onDismiss,
  position = "bottom-right",
  placement,
  fixed = false,
  portal,
  portalRoot,
  maxVisible = 4,
  className,
  classNames,
  icons,
  renderToast,
  labels,
  onPause,
  onResume,
}: AnimatedToastStackProps) {
  const { t } = useI18n();
  const stackRef = useRef<HTMLOListElement>(null);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const visibleToasts = toasts.slice(-maxVisible);
  const isBottom = position.startsWith("bottom");
  const resolvedPlacement = placement ?? (fixed ? "fixed" : "static");
  const shouldPortal = portal ?? resolvedPlacement === "fixed";

  useEffect(() => {
    setPortalTarget(shouldPortal ? (portalRoot ?? document.body) : null);
  }, [portalRoot, shouldPortal]);

  useEffect(() => {
    // Removing a focused close button does not always emit a blur event.
    const stack = stackRef.current;
    if (stack && !stack.contains(document.activeElement) && !stack.matches(":hover")) onResume?.();
  }, [toasts, onResume]);

  const stack = (
    <ol
      ref={stackRef}
      aria-label={t("feedback.notifications")}
      onMouseEnter={onPause}
      onMouseLeave={event => { if (!event.currentTarget.contains(document.activeElement)) onResume?.(); }}
      onFocusCapture={onPause}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(":hover")) onResume?.(); }}
      className={cn(
        "pointer-events-none flex w-[calc(100vw-2rem)] max-w-sm gap-2",
        isBottom ? "flex-col-reverse" : "flex-col",
        resolvedPlacement === "fixed" && "fixed z-[var(--toast-z)]",
        resolvedPlacement === "absolute" && "absolute z-20",
        resolvedPlacement !== "static" && POSITION_CLASS[position],
        classNames?.root,
        "print:hidden",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout" onExitComplete={() => {
        const stack = stackRef.current;
        if (stack && !stack.contains(document.activeElement) && !stack.matches(":hover")) onResume?.();
      }}>
        {visibleToasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            index={index}
            onDismiss={onDismiss}
            classNames={classNames}
            icons={icons}
            renderToast={renderToast}
            dismissLabel={labels?.dismiss ?? t("feedback.dismiss")}
          />
        ))}
      </AnimatePresence>
    </ol>
  );

  if (shouldPortal && !portalTarget) {
    return null;
  }

  if (shouldPortal && portalTarget) {
    return createPortal(stack, portalTarget);
  }

  return stack;
}

const ToastItem = memo(function ToastItem({
  toast,
  index,
  onDismiss,
  classNames,
  icons,
  renderToast,
  dismissLabel,
}: {
  toast: AnimatedToast;
  index: number;
  onDismiss?: (id: string) => void;
  classNames?: ToastClassNames;
  icons?: Partial<Record<ToastStatus, ReactNode>>;
  renderToast?: (toast: AnimatedToast) => ReactNode;
  dismissLabel: string;
}) {
  const reduce = useReducedMotion();
  const status = toast.status ?? "neutral";
  const Icon = STATUS_ICON[status];
  const iconNode = icons?.[status] ?? toast.icon ?? <Icon className="h-3.5 w-3.5" />;
  const canDismiss = toast.dismissible !== false && Boolean(onDismiss);
  const hasDetails = Boolean(toast.description || toast.action);

  return (
    <motion.li
      layout={!reduce}
      role={status === "error" ? "alert" : "status"}
      aria-atomic="true"
      initial={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, y: 22, scale: 0.96, filter: "blur(10px)" }
      }
      animate={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
      }
      exit={
        reduce
          ? { opacity: 0 }
          : {
              opacity: 0,
              x: 32,
              scale: 0.96,
              filter: "blur(8px)",
              transition: { duration: 0.18, ease: EASE_OUT },
            }
      }
      transition={reduce ? { duration: 0.12 } : STACK_SPRING}
      drag={canDismiss && !reduce ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      onDragEnd={(_, info) => {
        if (!canDismiss || !onDismiss) return;
        if (Math.abs(info.offset.x) > 72 || Math.abs(info.velocity.x) > 520) {
          onDismiss(toast.id);
        }
      }}
      className={cn("pointer-events-auto relative will-change-transform", classNames?.item)}
      style={{ zIndex: 20 - index }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-box border border-hairline bg-surface p-3 text-ink",
          classNames?.surface,
        )}
      >
        {renderToast ? (
          renderToast(toast)
        ) : (
          <div className={cn("flex gap-3", hasDetails ? "items-start" : "items-center")}>
            <motion.span
              layout
              className={cn(
                "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                hasDetails && "mt-0.5",
                STATUS_CLASS[status],
                classNames?.iconWrap,
              )}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={status}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: 8, scale: 0.8, filter: "blur(6px)" }
                  }
                  animate={
                    reduce
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                  }
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: -8, scale: 0.9, filter: "blur(6px)" }
                  }
                  transition={CONTENT_TRANSITION}
                  className="inline-flex"
                >
                  {status === "loading" ? (
                    <span className="inline-flex animate-spin motion-reduce:animate-none">{iconNode}</span>
                  ) : (
                    iconNode
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.span>

            <div className={cn("min-w-0 flex-1", classNames?.content)}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={`${toast.id}-${status}-${String(toast.title)}`}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: 8, filter: "blur(6px)" }
                  }
                  animate={
                    reduce
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0, filter: "blur(0px)" }
                  }
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: -8, filter: "blur(6px)" }
                  }
                  transition={CONTENT_TRANSITION}
                >
                  <p
                    className={cn(
                      "text-sm font-medium leading-5 text-ink [overflow-wrap:anywhere]",
                      classNames?.title,
                    )}
                  >
                    {toast.title}
                  </p>
                  {toast.description ? (
                    <p
                      className={cn(
                        "mt-1 text-sm leading-5 text-ink-soft [overflow-wrap:anywhere]",
                        classNames?.description,
                      )}
                    >
                      {toast.description}
                    </p>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {toast.action ? (
                <button
                  type="button"
                  onClick={() => toast.action?.onClick(toast)}
                  className={cn(
                    "mt-2 inline-flex min-h-11 items-center rounded-pill bg-muted px-3 text-xs font-medium text-ink transition-colors hover:bg-base-300 focus-visible:outline-2 focus-visible:outline-ring",
                    classNames?.action,
                  )}
                >
                  {toast.action.label}
                </button>
              ) : null}
            </div>

            {canDismiss ? (
              <button
                type="button"
                onClick={() => onDismiss?.(toast.id)}
                aria-label={dismissLabel}
                className={cn(
                  "inline-flex size-11 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ring",
                  classNames?.close,
                )}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        )}

      </div>
    </motion.li>
  );
});
