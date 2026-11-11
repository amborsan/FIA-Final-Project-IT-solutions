import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";

const colors: Record<string, string> = {
  NEW: "bg-info text-info-content border-info",
  REVIEWING: "bg-warning text-warning-content border-warning",
  QUOTED: "bg-info text-info-content border-info",
  APPROVED: "bg-success text-success-content border-success",
  SCHEDULED: "bg-info text-info-content border-info",
  IN_PROGRESS: "bg-warning text-warning-content border-warning",
  COMPLETED: "bg-success text-success-content border-success",
  CANCELLED: "bg-error text-error-content border-error",
  PENDING: "bg-warning text-warning-content border-warning",
  CONFIRMED: "bg-info text-info-content border-info",
  PROCESSING: "bg-warning text-warning-content border-warning",
  DRAFT: "bg-base-200 text-base-content",
  PUBLISHED: "bg-success text-success-content border-success",
  SENT: "bg-info text-info-content border-info",
  ACCEPTED: "bg-success text-success-content border-success",
  REJECTED: "bg-error text-error-content border-error",
  EXPIRED: "bg-base-200 text-base-content",
  OPEN: "bg-warning text-warning-content border-warning",
  WAITING_CUSTOMER: "bg-info text-info-content border-info",
  RESOLVED: "bg-success text-success-content border-success",
  CLOSED: "bg-base-200 text-base-content",
  LOW: "bg-base-200 text-base-content",
  MEDIUM: "bg-info text-info-content border-info",
  HIGH: "bg-warning text-warning-content border-warning",
  URGENT: "bg-error text-error-content border-error",
  ISSUED: "bg-info text-info-content border-info",
  PAID: "bg-success text-success-content border-success",
  OVERDUE: "bg-error text-error-content border-error",
  SUBMITTED: "bg-info text-info-content border-info",
  READ: "bg-base-200 text-base-content",
  REPLIED: "bg-success text-success-content border-success",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const key = `status.${status}` as TranslationKey;
  const label = t(key);
  return (
    <Badge className={cn(` h-5 text-xs whitespace-nowrap ${colors[status] ?? "bg-base-200 text-base-content"}`)}>
      {label === key ? status.replaceAll("_", " ").toLowerCase() : label}
    </Badge>
  );
}

export function PageLoader({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div role="status" className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <span aria-hidden="true" className={cn("inline-block size-6 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none size-10 text-primary")} />
      <p className="text-sm text-base-content/70">{label ?? t("common.loading")}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <Alert className={cn("flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-error text-error-content border-error my-6")}>
      <span>{message || t("common.error")}</span>
      {onRetry && (
        <Button className={cn(" h-8 px-3 text-sm")} onClick={onRetry}>
          {t("common.retry")}
        </Button>
      )}
    </Alert>
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
