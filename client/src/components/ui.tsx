import type { ReactNode } from "react";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";

const colors: Record<string, string> = {
  NEW: "ds-badge-info",
  REVIEWING: "ds-badge-warning",
  QUOTED: "ds-badge-info",
  APPROVED: "ds-badge-success",
  SCHEDULED: "ds-badge-info",
  IN_PROGRESS: "ds-badge-info",
  COMPLETED: "ds-badge-success",
  CANCELLED: "ds-badge-error",
  PENDING: "ds-badge-warning",
  CONFIRMED: "ds-badge-info",
  PROCESSING: "ds-badge-info",
  DRAFT: "ds-badge-ghost",
  PUBLISHED: "ds-badge-success",
  SENT: "ds-badge-info",
  ACCEPTED: "ds-badge-success",
  REJECTED: "ds-badge-error",
  EXPIRED: "ds-badge-ghost",
  OPEN: "ds-badge-warning",
  WAITING_CUSTOMER: "ds-badge-info",
  RESOLVED: "ds-badge-success",
  CLOSED: "ds-badge-ghost",
  LOW: "ds-badge-ghost",
  MEDIUM: "ds-badge-info",
  HIGH: "ds-badge-warning",
  URGENT: "ds-badge-error",
  ISSUED: "ds-badge-info",
  PAID: "ds-badge-success",
  OVERDUE: "ds-badge-error",
  SUBMITTED: "ds-badge-info",
  READ: "ds-badge-ghost",
  REPLIED: "ds-badge-success",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const key = `status.${status}` as TranslationKey;
  const label = t(key);
  return (
    <span className={`ds-badge ds-badge-sm whitespace-nowrap ${colors[status] ?? "ds-badge-ghost"}`}>
      {label === key ? status.replaceAll("_", " ").toLowerCase() : label}
    </span>
  );
}

export function PageLoader({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div role="status" aria-live="polite" className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <span aria-hidden="true" className="ds-loading ds-loading-spinner ds-loading-lg text-primary" />
      <p className="text-sm text-base-content/70">{label ?? t("common.loading")}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="ds-alert ds-alert-error my-6">
      <span>{message || t("common.error")}</span>
      {onRetry && (
        <button className="ds-btn ds-btn-sm" onClick={onRetry}>
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-md text-sm text-base-content/70">{text}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-relaxed text-base-content/65">{text}</p>}
    </div>
  );
}
