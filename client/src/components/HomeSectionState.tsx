import type { ReactNode } from "react";
import { EmptyState, ErrorState, PageLoader } from "./ui";

type HomeSectionStateProps = {
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  hasItems: boolean;
  loadingLabel: string;
  errorLabel: string;
  emptyTitle: string;
  onRetry: () => void;
  children: ReactNode;
};

// Three independent homepage queries share presentation, never query state.
export function HomeSectionState({
  isPending, isFetching, isError, hasItems, loadingLabel,
  errorLabel, emptyTitle, onRetry, children,
}: HomeSectionStateProps) {
  if (isPending) return <PageLoader label={loadingLabel} compact />;
  if (isError) return <>
    <ErrorState message={errorLabel} onRetry={onRetry} retrying={isFetching} />
    {hasItems && children}
  </>;
  if (!hasItems) return <div role="status"><EmptyState title={emptyTitle} /></div>;
  return <>
    {isFetching && <p role="status" className="mb-4 text-sm text-ink-muted">{loadingLabel}</p>}
    {children}
  </>;
}
