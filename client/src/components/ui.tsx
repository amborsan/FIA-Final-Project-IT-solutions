import type { ReactNode } from "react";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";

const colors: Record<string, string> = {
  NEW: "badge-info",
  REVIEWING: "badge-warning",
  QUOTED: "badge-info",
  APPROVED: "badge-success",
  SCHEDULED: "badge-info",
  IN_PROGRESS: "badge-warning",
  COMPLETED: "badge-success",
  CANCELLED: "badge-error",
  PENDING: "badge-warning",
  CONFIRMED: "badge-info",
  PROCESSING: "badge-warning",
  DRAFT: "badge-ghost",
  PUBLISHED: "badge-success",
  SENT: "badge-info",
  ACCEPTED: "badge-success",
  REJECTED: "badge-error",
  EXPIRED: "badge-ghost",
  OPEN: "badge-warning",
  WAITING_CUSTOMER: "badge-info",
  RESOLVED: "badge-success",
  CLOSED: "badge-ghost",
  LOW: "badge-ghost",
  MEDIUM: "badge-info",
  HIGH: "badge-warning",
  URGENT: "badge-error",
  ISSUED: "badge-info",
  PAID: "badge-success",
  OVERDUE: "badge-error",
  SUBMITTED: "badge-info",
  READ: "badge-ghost",
  REPLIED: "badge-success",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const key = `status.${status}` as TranslationKey;
  const label = t(key);
  return (
    <span className={`badge badge-sm whitespace-nowrap ${colors[status] ?? "badge-ghost"}`}>
      {label === key ? status.replaceAll("_", " ").toLowerCase() : label}
    </span>
  );
}

export function PageLoader({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p className="text-sm text-base-content/70">{label ?? t("common.loading")}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="alert alert-error my-6">
      <span>{message || t("common.error")}</span>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry}>
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
