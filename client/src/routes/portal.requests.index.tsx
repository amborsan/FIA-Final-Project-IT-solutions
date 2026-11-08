import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { api } from "../lib/api";
import type { ServiceRequest } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/portal/requests/")({
  component: RequestsPage,
});

function RequestsPage() {
  const { t, pick, formatDate, formatMoney } = useI18n();
  const nav = usePortalNav();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<{ requests: ServiceRequest[] }>("/requests"),
  });

  const requests = data?.requests ?? [];

  return (
    <DashboardShell
      nav={nav}
      title={t("requests.title")}
      subtitle={t("requests.text")}
      actions={
        <Link to="/quote" search={{ service: undefined }} className="ds-btn ds-btn-primary ds-btn-sm">
          <Plus className="h-4 w-4" /> {t("requests.new")}
        </Link>
      }
    >
      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && requests.length === 0 && (
        <EmptyState
          title={t("requests.noQuotes")}
          text={t("requests.text")}
          action={
            <Link to="/quote" search={{ service: undefined }} className="ds-btn ds-btn-primary ds-btn-sm">
              {t("requests.new")}
            </Link>
          }
        />
      )}

      {requests.length > 0 && (
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="ds-table ds-table-zebra">
            <thead>
              <tr>
                <th>{t("common.reference")}</th>
                <th>{t("common.title")}</th>
                <th>{t("requests.service")}</th>
                <th>{t("requests.createdAt")}</th>
                <th>{t("requests.budget")}</th>
                <th>{t("requests.status")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="font-mono text-xs">{request.reference}</td>
                  <td>
                    <p className="max-w-56 truncate font-semibold">{request.title}</p>
                    <p className="text-[11px] text-base-content/70">
                      {request.technician?.fullName ?? t("requests.unassigned")}
                    </p>
                  </td>
                  <td className="text-xs">
                    {request.service ? pick(request.service.nameEn, request.service.nameDe) : "–"}
                  </td>
                  <td className="text-xs">{formatDate(request.createdAt)}</td>
                  <td className="text-xs">{request.budget ? formatMoney(request.budget) : "–"}</td>
                  <td>
                    <StatusBadge status={request.status} />
                  </td>
                  <td>
                    <Link
                      to="/portal/requests/$id"
                      params={{ id: request.id }}
                      className="ds-btn ds-btn-ghost ds-btn-xs"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
