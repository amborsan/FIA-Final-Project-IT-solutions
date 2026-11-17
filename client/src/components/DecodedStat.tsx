import { useEffect, useRef } from "react";
import { useInView } from "motion/react";

export function DecodedStat({ value, index }: { value: string; index: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const output = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    const text = output.current;
    if (!inView || !text || played.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const start = performance.now();
    const delay = index * 50;
    const finish = () => {
      cancelAnimationFrame(frame);
      played.current = true;
      text.textContent = value;
      text.dataset.state = "settled";
    };
    const tick = (now: number) => {
      played.current = true;
      const elapsed = now - start;
      if (elapsed >= 700 || reduce.matches) { finish(); return; }
      const progress = Math.max(0, (elapsed - delay) / (700 - delay));
      const resolved = Math.floor(progress * value.length);
      const glyphs = "#+0X";
      text.dataset.state = "decoding";
      text.textContent = value.replace(/\d/g, (digit, position: number) =>
        position < resolved ? digit : glyphs[(Math.floor(elapsed / 45) + position * 3 + index) % glyphs.length]);
      frame = requestAnimationFrame(tick);
    };
    if (reduce.matches) finish();
    else frame = requestAnimationFrame(tick);
    reduce.addEventListener("change", finish);
    return () => {
      cancelAnimationFrame(frame);
      reduce.removeEventListener("change", finish);
    };
  }, [inView, value, index]);

  return (
    <span ref={ref} className="home-hero-stat-number">
      <span className="sr-only">{value}</span>
      {/* The final value reserves its exact width throughout decoding. */}
      <span className="home-hero-stat-measure" aria-hidden="true">{value}</span>
      <span ref={output} className="home-hero-stat-decoded" aria-hidden="true" data-state="idle">{value}</span>
    </span>
  );
}
