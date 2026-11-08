import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

// Decorative loops run only while someone can see them, with a manual pause.
export function MotionScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const { t } = useI18n();
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let intersects = false;
    const update = () => setVisible(intersects && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      intersects = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  return <section ref={ref} className="fia-art" data-paused={paused || !visible}>
    <div aria-hidden="true">{children}</div>
    <button type="button" className="motion-toggle ds-btn ds-btn-sm" onClick={() => setPaused(!paused)} aria-label={t(paused ? "motion.resume" : "motion.pause")}>
      {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
    </button>
  </section>;
}
