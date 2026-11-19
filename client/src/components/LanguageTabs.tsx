// Pill and text-mask motion adapted from https://beui.dev/components/motion/tabs.
// Language preferences keep their existing pressed-button semantics.
import { useId, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { cancelFrame, frame, motion } from "motion/react";
import { useI18n } from "../i18n/I18nContext";
import type { Language } from "../i18n/translations";
import { cn } from "../lib/utils";
import { SPRING_TABS } from "./beui/ease";
import { useReducedMotionPreference } from "./beui/useReducedMotionPreference";

const languages = ["en", "de"] as const;

export function LanguageTabs({ className }: { className?: string }) {
  const { t, language, setLanguage } = useI18n();
  const id = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionPreference();

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let frames = 0;
    let stillFrames = 0;
    let previous: { left: number; right: number } | undefined;
    const syncLabels = () => {
      const indicator = viewport.querySelector<HTMLElement>("[data-language-indicator]");
      const selected = viewport.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!indicator || !selected) return;
      const pill = (reduce ? selected : indicator).getBoundingClientRect();
      const labels = Array.from(viewport.querySelectorAll<HTMLElement>("[data-language-label]"));
      // Read every box before writing masks, including during interrupted glides.
      const clips = labels.map(label => {
        const bounds = label.getBoundingClientRect();
        const left = Math.max(0, Math.min(bounds.width, pill.left - bounds.left));
        const right = Math.max(0, Math.min(bounds.width, bounds.right - pill.right));
        return left + right >= bounds.width ? "inset(0 100% 0 0)" : `inset(0 ${right}px 0 ${left}px)`;
      });
      labels.forEach((label, index) => { label.style.clipPath = clips[index]; });
      frames += 1;
      stillFrames = previous && Math.abs(pill.left - previous.left) < 0.01 && Math.abs(pill.right - previous.right) < 0.01 ? stillFrames + 1 : 0;
      previous = { left: pill.left, right: pill.right };
      if (reduce || (frames > 2 && stillFrames >= 2) || frames >= 120) cancelFrame(syncLabels);
    };
    const restart = () => {
      frames = 0;
      stillFrames = 0;
      previous = undefined;
      cancelFrame(syncLabels);
      frame.postRender(syncLabels, true);
    };
    const resize = new ResizeObserver(restart);
    resize.observe(viewport);
    restart();
    return () => { resize.disconnect(); cancelFrame(syncLabels); };
  }, [language, reduce]);

  function reveal(button: HTMLButtonElement) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    const item = button.getBoundingClientRect();
    const delta = item.left < bounds.left ? item.left - bounds.left : item.right > bounds.right ? item.right - bounds.right : 0;
    if (delta) viewport.scrollBy({ left: delta, behavior: reduce ? "auto" : "smooth" });
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, code: Language) {
    const next = event.key === "Home" ? "en" : event.key === "End" ? "de"
      : event.key === "ArrowLeft" || event.key === "ArrowRight" ? (code === "en" ? "de" : "en") : null;
    if (!next) return;
    event.preventDefault();
    viewportRef.current?.querySelector<HTMLButtonElement>(`[data-language="${next}"]`)?.focus({ preventScroll: true });
    setLanguage(next);
  }

  return (
    <motion.div layoutRoot className={cn("w-fit max-w-full min-w-0 shrink-0", className)}>
      <motion.div ref={viewportRef} layoutScroll className="max-w-full overflow-x-auto overscroll-x-contain rounded-pill border border-base-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div role="group" aria-label={t("language.label")} className="flex w-max items-center gap-0.5 p-0.5">
          {languages.map(code => (
            <div key={code} className="relative shrink-0">
              {language === code && <motion.span aria-hidden="true" data-language-indicator="" layoutId={`${id}-indicator`} initial={false}
                transition={reduce ? { duration: 0 } : SPRING_TABS}
                className="pointer-events-none absolute inset-0 rounded-pill bg-primary" />}
              <button type="button" data-language={code} aria-pressed={language === code} tabIndex={language === code ? 0 : -1}
                onClick={() => setLanguage(code)} onKeyDown={event => navigate(event, code)} onFocus={event => reveal(event.currentTarget)}
                className="relative z-10 inline-flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap rounded-pill bg-transparent px-2 py-1 text-xs font-semibold text-base-content/70 outline-none hover:text-base-content focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                {code.toUpperCase()}
                <span aria-hidden="true" inert data-language-label="" style={{ clipPath: "inset(0 100% 0 0)" }}
                  className="pointer-events-none absolute inset-0 inline-flex items-center justify-center text-primary-content">
                  {code.toUpperCase()}
                </span>
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
