import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Order } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { ArchiveTabs, FilterSelect, ListToolbar, Pagination, SearchField } from "../components/ListControls";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";
import { filterByArchive, matchesSearch, paginate, useListControls } from "../lib/list";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

const orderStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"];
const archivedStatuses = new Set(["COMPLETED", "CANCELLED"]);

function AdminOrdersPage() {
  const { t, formatDate, formatMoney } = useI18n();
  const nav = useAdminNav();
  const queryClient = useQueryClient();
  const controls = useListControls();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api<{ orders: Order[] }>("/orders"),
  });

  const orders = data?.orders ?? [];

  const filtered = filterByArchive(
    orders.filter(
      (order) =>
        (!controls.status || order.status === controls.status) &&
        matchesSearch(
          controls.search,
          order.reference,
          order.customer?.fullName,
          order.customer?.email,
          order.invoice?.number,
          order.items.map((item) => item.description).join(" "),
        ),
    ),
    controls.archive,
    (order) => archivedStatuses.has(order.status),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  async function updateOrder(id: string, status: string) {
    setBusy(id);
    setError("");
    try {
      await api(`/orders/${id}/status`, { method: "PATCH", body: { status } });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy("");
    }
  }

  async function markPaid(invoiceId: string) {
    setBusy(invoiceId);
    setError("");
    try {
      await api(`/invoices/${invoiceId}/pay`, { method: "PATCH" });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy("");
    }
  }

  return (
    <DashboardShell nav={nav} title={t("admin.orders")} subtitle={t("orders.text")}>
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchOrders")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={orderStatuses.map((value) => ({
            value,
            label: t(`status.${value}` as "status.PENDING"),
          }))}
          allLabel={t("common.all")}
          ariaLabel={t("common.status")}
        />
        <ArchiveTabs value={controls.archive} onChange={controls.setArchive} />
      </ListToolbar>

      {isLoading && <PageLoader />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && pageData.total === 0 && (
        <div className="mt-5">
          <EmptyState title={t("orders.noOrders")} />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 space-y-3">
          {pageData.items.map((order) => (
            <div key={order.id} className="rounded-box border border-base-300 bg-base-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold">{order.reference}</p>
                  <p className="text-[11px] text-base-content/70">
                    {order.customer?.fullName} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold">{formatMoney(order.total)}</span>
                  <StatusBadge status={order.status} />
                  <select
                    value={order.status}
                    onChange={(event) => void updateOrder(order.id, event.target.value)}
                    disabled={busy === order.id}
                    className="select select-bordered select-xs"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {t(`status.${status}` as "status.PENDING")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-base-content/65">
                {order.items.map((item) => (
                  <span key={item.id}>
                    {item.quantity} × {item.description}
                  </span>
                ))}
              </div>

              {order.invoice && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-base-200/70 px-3 py-2 text-xs">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    {order.invoice.number} · {formatDate(order.invoice.dueAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <StatusBadge status={order.invoice.status} />
                    <span className="font-semibold">{formatMoney(order.invoice.amount)}</span>
                    {order.invoice.status !== "PAID" && (
                      <button
                        onClick={() => void markPaid(order.invoice!.id)}
                        disabled={busy === order.invoice.id}
                        className="btn btn-success btn-xs"
                      >
                        {busy === order.invoice.id && <Loader2 className="h-3 w-3 animate-spin" />}
                        {t("admin.markPaid")}
                      </button>
                    )}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={pageData.page}
        totalPages={pageData.totalPages}
        from={pageData.from}
        to={pageData.to}
        total={pageData.total}
        pageSize={controls.pageSize}
        onPageChange={controls.setPage}
        onPageSizeChange={controls.setPageSize}
      />
    </DashboardShell>
  );
}
