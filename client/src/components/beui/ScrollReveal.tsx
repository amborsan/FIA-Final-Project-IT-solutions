"use client";
// beui.dev/components/motion/scroll-animation

import { motion, useInView } from "motion/react";
import { type ReactNode, type RefObject, useRef, useState } from "react";

import { EASE_OUT } from "./ease";
import { cn } from "@/lib/utils";
import { useReducedMotionPreference } from "./useReducedMotionPreference";

export interface ScrollRevealProps {
  children: ReactNode;
  /** Slide distance in px before reveal. */
  y?: number;
  /** Enter blur in px (kept ≤ 10 per motion conventions). */
  blur?: number;
  /** Reveal duration in seconds. */
  duration?: number;
  delay?: number;
  /** Reveal only once (default) or every time it enters view. */
  once?: boolean;
  /** Portion of the element that must be visible to trigger. */
  amount?: "some" | "all" | number;
  /** Scroll root for contained scroll areas. Defaults to the viewport. */
  root?: RefObject<Element | null>;
  className?: string;
}

export function ScrollReveal({
  children,
  y = 16,
  blur = 8,
  duration = 0.6,
  delay = 0,
  once = true,
  amount = 0.08,
  root,
  className,
}: ScrollRevealProps) {
  const reduce = useReducedMotionPreference();
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { root, once, amount });

  const hidden = reduce
    ? { opacity: 0 }
    : { opacity: 0, y, filter: `blur(${blur}px)` };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <motion.div
      ref={ref}
      data-slot="scroll-reveal"
      data-revealed={reduce || focused || inView}
      onFocusCapture={() => setFocused(true)}
      initial={reduce ? false : hidden}
      animate={reduce || focused || inView ? shown : hidden}
      transition={{ duration: reduce || focused ? 0 : duration, ease: EASE_OUT, delay: reduce || focused ? 0 : delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
