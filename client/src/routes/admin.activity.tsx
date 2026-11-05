import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity as ActivityIcon } from "lucide-react";
import { api } from "../lib/api";
import type { Activity } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { EmptyState, ErrorState, PageLoader } from "../components/ui";

export const Route = createFileRoute("/admin/activity")({
  component: AdminActivityPage,
});

function AdminActivityPage() {
  const { t, formatDateTime } = useI18n();
  const nav = useAdminNav();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: () => api<{ activity: Activity[] }>("/admin/activity"),
  });

  const entries = data?.activity ?? [];

  return (
    <DashboardShell nav={nav} title={t("admin.activity")} subtitle={t("admin.recentActivity")}>
      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && entries.length === 0 && <EmptyState title={t("admin.noActivity")} />}

      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 rounded-box border border-base-300 bg-base-100 p-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ActivityIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm">{entry.description}</p>
              <p className="text-[11px] text-base-content/70">
                {entry.user?.fullName || "System"}
                {entry.user?.role ? ` · ${t(`role.${entry.user.role}` as "role.ADMIN")}` : ""} ·{" "}
                {formatDateTime(entry.createdAt)}
              </p>
              {entry.entityType && (
                <p className="mt-0.5 font-mono text-[10px] text-base-content/65">
                  {entry.entityType}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
