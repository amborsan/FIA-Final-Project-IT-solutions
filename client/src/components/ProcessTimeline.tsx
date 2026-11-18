import { useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useInView } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import { Timeline } from "./beui/Timeline";

type ProcessPhase = {
  title: string;
  steps: { number: number; title: string; text: string }[];
};


const desktopQuery = "(min-width: 64rem)";
function subscribeLayout(notify: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
const isDesktop = () => window.matchMedia(desktopQuery).matches;

function PhaseSteps({ phase }: { phase: ProcessPhase }) {
  return <ol role="list" start={phase.steps[0].number} className="process-steps">
    {phase.steps.map(step => <li key={step.number} className="process-step">
      <span aria-hidden="true" className="process-step-number">{String(step.number).padStart(2, "0")}</span>
      <div><h4 className="process-step-title">{step.title}</h4><p className="process-step-description">{step.text}</p></div>
    </li>)}
  </ol>;
}

function MobileTimeline({ phases }: { phases: ProcessPhase[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const entered = useInView(ref, { once: true, amount: 0.15 });
  return <div ref={ref} className="process-timeline" data-entered={entered}>
    {phases.map((phase, index) => <div key={phase.title} className="process-phase"
      style={{ "--process-phase-delay": String(index * 120) + "ms" } as CSSProperties}>
      <span className="process-marker" aria-hidden="true"><i /><i /><i /><i /></span>
      <h3 className="process-phase-title">{phase.title}</h3>
      <PhaseSteps phase={phase} />
    </div>)}
  </div>;
}

export function ProcessTimeline({ phases }: { phases: ProcessPhase[] }) {
  const { t } = useI18n();
  const desktop = useSyncExternalStore(subscribeLayout, isDesktop, () => false);
  const [active, setActive] = useState("phase-2");
  const activeIndex = Math.max(0, phases.findIndex((_, index) => "phase-" + (index + 1) === active));
  const events = phases.map((phase, index) => ({
    id: "phase-" + (index + 1),
    label: t("home.processPhaseLabel", { number: String(index + 1).padStart(2, "0") }),
    title: phase.title,
    media: <PhaseSteps phase={phase} />,
    meta: t("home.processStepRange", {
      from: String(phase.steps[0].number).padStart(2, "0"),
      to: String(phase.steps.at(-1)!.number).padStart(2, "0"),
    }),
  }));
  return <div className="process-timeline-view" data-layout={desktop ? "carousel" : "vertical"}>
    {desktop ? <div className="process-carousel">
      <Timeline events={events} value={active} onValueChange={setActive}
        label={t("home.processTimeline")} hint={t("home.processTimelineHint")} className="process-carousel-stage" />
      <div className="process-carousel-controls">
        <p className="text-sm text-ink-muted">{t("home.processTimelineHint")}</p>
        <div className="flex items-center gap-3">
          <button type="button" className="process-carousel-control" aria-label={t("home.processPrevious")}
            disabled={activeIndex === 0} onClick={() => setActive("phase-" + activeIndex)}><ChevronLeft aria-hidden="true" className="size-4" /></button>
          <span className="text-sm tabular-nums text-ink-muted" aria-live="polite" aria-atomic="true">{activeIndex + 1} / {phases.length}</span>
          <button type="button" className="process-carousel-control" aria-label={t("home.processNext")}
            disabled={activeIndex === phases.length - 1} onClick={() => setActive("phase-" + (activeIndex + 2))}><ChevronRight aria-hidden="true" className="size-4" /></button>
        </div>
      </div>
    </div> : <MobileTimeline phases={phases} />}
  </div>;
}
