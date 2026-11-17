import { useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";

type ProcessPhase = {
  title: string;
  steps: { number: number; title: string; text: string }[];
};

export function ProcessTimeline({ phases }: { phases: ProcessPhase[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const entered = useInView(ref, { once: true, amount: 0.15 });

  return (
    <div ref={ref} className="process-timeline" data-entered={entered}>
      {phases.map((phase, index) => (
        <div key={phase.title} className="process-phase"
          style={{ "--process-phase-delay": `${index * 120}ms` } as CSSProperties}>
          <span className="process-marker" aria-hidden="true"><i /><i /><i /><i /></span>
          <h3 className="process-phase-title">{phase.title}</h3>
          <ol role="list" start={phase.steps[0].number} className="process-steps">
            {phase.steps.map(step => (
              <li key={step.number} className="process-step">
                <span aria-hidden="true" className="process-step-number">{String(step.number).padStart(2, "0")}</span>
                <div>
                  <h4 className="process-step-title">{step.title}</h4>
                  <p className="process-step-description">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
