import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import { api } from "../lib/api";
import type { ServiceRequest } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/admin/requests/")({
  component: AdminRequestsPage,
});

function AdminRequestsPage() {
  const { t, pick, formatDate, formatMoney } = useI18n();
  const nav = useAdminNav();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<{ requests: ServiceRequest[] }>("/requests"),
  });

  const requests = (data?.requests ?? []).filter((request) => {
    const matchesStatus = !status || request.status === status;
    const haystack = `${request.reference} ${request.title} ${request.contactName} ${request.contactEmail}`.toLowerCase();
    return matchesStatus && haystack.includes(search.toLowerCase());
  });

  return (
    <DashboardShell nav={nav} title={t("admin.requests")} subtitle={t("requests.text")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="input input-bordered flex w-full max-w-md items-center gap-2">
          <Search className="h-4 w-4 opacity-50" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("common.searchPlaceholder")}
            className="grow"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="select select-bordered w-full sm:w-52"
        >
          <option value="">{t("admin.all")}</option>
          {["NEW", "REVIEWING", "QUOTED", "APPROVED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(
            (value) => (
              <option key={value} value={value}>
                {t(`status.${value}` as "status.NEW")}
              </option>
            ),
          )}
        </select>
      </div>

      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && requests.length === 0 && (
        <div className="mt-5">
          <EmptyState title={t("admin.noResults")} />
        </div>
      )}

      {requests.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>{t("common.reference")}</th>
                <th>{t("common.title")}</th>
                <th>{t("common.customer")}</th>
                <th>{t("common.date")}</th>
                <th>{t("requests.budget")}</th>
                <th>{t("common.status")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="font-mono text-[11px]">{request.reference}</td>
                  <td>
                    <p className="max-w-56 truncate font-semibold">{request.title}</p>
                    <p className="text-[11px] text-base-content/70">
                      {request.service ? pick(request.service.nameEn, request.service.nameDe) : "–"}
                    </p>
                  </td>
                  <td className="text-xs">
                    {request.customer?.fullName || request.contactName}
                    <br />
                    <span className="text-[10px] text-base-content/70">{request.contactEmail}</span>
                  </td>
                  <td className="text-xs">{formatDate(request.createdAt)}</td>
                  <td className="text-xs">{request.budget ? formatMoney(request.budget) : "–"}</td>
                  <td>
                    <StatusBadge status={request.status} />
                  </td>
                  <td>
                    <Link
                      to="/admin/requests/$id"
                      params={{ id: request.id }}
                      className="btn btn-ghost btn-xs"
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
