import type { ReactNode } from "react";
import { ActionSwapIcon, ActionSwapText } from "./beui/ActionSwap";
import { cn } from "../lib/utils";

/** Change only the contents: the existing button owns colors, dimensions and submission. */
export function ActionButtonContent({ state, label, icon, reserveLabel = label, textClassName }: {
  state: string;
  label: string;
  icon: ReactNode;
  reserveLabel?: string;
  textClassName?: string;
}) {
  return <>
    <ActionSwapIcon value={state} animation="cascade" className="size-4">{icon}</ActionSwapIcon>
    <span className={cn("inline-grid min-w-0", textClassName)}>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {Array.from(reserveLabel).map((letter, index) => <span key={index} className="inline-block whitespace-pre">{letter}</span>)}
      </span>
      <ActionSwapText value={state} animation="cascade" className="col-start-1 row-start-1">{label}</ActionSwapText>
    </span>
  </>;
}
