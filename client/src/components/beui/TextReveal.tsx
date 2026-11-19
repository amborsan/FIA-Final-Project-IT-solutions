// Adapted from https://beui.dev/components/motion/text-animation.
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { EASE_OUT } from "./ease";

type TextRevealProps = {
  text: string;
  delay?: number;
  replay?: number;
  revealOnMount?: boolean;
};

export function TextReveal({ text, delay = 0, replay = 0, revealOnMount = true }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const words = text.match(/\S+\s*/g) ?? [];
  // Hover replays start immediately; only the first entrance staggers the groups.
  const startDelay = replay > 0 ? 0 : delay;
  const reveal = !reduce && (revealOnMount || replay > 0);

  return (
    <span ref={ref} className="block">
      {/* Keep the full label intact for screen readers while words animate. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <motion.span
            key={`${replay}-${index}-${word}`}
            className="inline-block whitespace-pre"
            initial={reveal ? { y: "40%", opacity: 0, filter: "blur(6px)" } : false}
            animate={inView || !reveal
              ? { y: 0, opacity: 1, filter: "blur(0px)" }
              : { y: "40%", opacity: 0, filter: "blur(6px)" }}
            transition={reduce ? { duration: 0 } : {
              y: { type: "spring", stiffness: 140, damping: 26, mass: 1.2, delay: startDelay + index * 0.09 },
              opacity: { duration: 0.7, ease: EASE_OUT, delay: startDelay + index * 0.09 },
              filter: { duration: 0.9, ease: EASE_OUT, delay: startDelay + index * 0.09 },
            }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
