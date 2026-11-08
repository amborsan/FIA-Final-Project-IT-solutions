import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Printer, ShoppingBag } from "lucide-react";
import { api } from "../lib/api";
import type { Order } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { DashboardShell, Panel } from "../components/DashboardShell";
import { ArchiveTabs, FilterSelect, ListToolbar, Pagination, SearchField } from "../components/ListControls";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "../components/ui";
import { filterByArchive, matchesSearch, paginate, useListControls } from "../lib/list";

export const Route = createFileRoute("/portal/orders/")({
  component: OrdersPage,
});

const orderStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"];
const archivedStatuses = new Set(["COMPLETED", "CANCELLED"]);

function OrdersPage() {
  const { t, formatDate, formatMoney, pick } = useI18n();
  const nav = usePortalNav();
  const controls = useListControls(6);

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
          order.invoice?.number,
          order.items.map((item) => item.description).join(" "),
        ),
    ),
    controls.archive,
    (order) => archivedStatuses.has(order.status),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  return (
    <DashboardShell nav={nav} title={t("orders.title")} subtitle={t("orders.text")}>
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
          <EmptyState
            title={t("orders.noOrders")}
            text={t("products.text")}
            action={
              <a href="/products" className="btn btn-primary btn-sm">
                {t("cart.continueShopping")}
              </a>
            }
          />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 space-y-4">
          {pageData.items.map((order) => (
            <Panel key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-mono text-sm font-bold">{order.reference}</p>
                    <p className="text-[11px] text-base-content/70">
                      {t("orders.placedOn")} {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="table table-xs">
                  <thead>
                    <tr>
                      <th>{t("common.description")}</th>
                      <th className="text-right">{t("common.quantity")}</th>
                      <th className="text-right">{t("common.price")}</th>
                      <th className="text-right">{t("common.total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.description}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">{formatMoney(item.unitPrice)}</td>
                        <td className="text-right">{formatMoney(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid gap-4 border-t border-base-200 pt-4 sm:grid-cols-2">
                <div className="text-xs text-base-content/70">
                  <p className="font-semibold text-base-content/80">{t("orders.shippingAddress")}</p>
                  <p className="mt-1">{order.shippingAddress || "–"}</p>
                  {order.notes && <p className="mt-2 italic">{order.notes}</p>}
                </div>
                <div className="space-y-1 text-sm sm:ml-auto sm:max-w-xs sm:text-right">
                  <div className="flex justify-between">
                    <span className="text-xs text-base-content/65">{t("common.subtotal")}</span>
                    <span>{formatMoney(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-base-content/65">
                      {t("common.tax")} ({Number(order.taxRate)} %)
                    </span>
                    <span>{formatMoney(order.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-base-200 pt-1 font-bold">
                    <span>{t("common.total")}</span>
                    <span>{formatMoney(order.total)}</span>
                  </div>
                </div>
              </div>

              {order.invoice && (
                <div className="mt-4 rounded-lg bg-base-200/70 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs font-semibold">
                          {t("orders.invoice")} {order.invoice.number}
                        </p>
                        <p className="text-[11px] text-base-content/65">
                          {t("orders.issuedAt")}: {formatDate(order.invoice.issuedAt)} ·{" "}
                          {t("orders.dueDate")}: {formatDate(order.invoice.dueAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.invoice.status} />
                      <span className="text-sm font-bold">{formatMoney(order.invoice.amount)}</span>
                      <button
                        onClick={() => window.print()}
                        className="btn btn-ghost btn-xs no-print"
                        title={t("common.print")}
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-base-content/70">
                    {pick(
                      "Demo invoice. A real invoice must contain the company's full legal details, tax number and sequential number.",
                      "Demo-Rechnung. Eine echte Rechnung muss vollständige Firmendaten, Steuernummer und fortlaufende Nummer enthalten.",
                    )}
                  </p>
                </div>
              )}
            </Panel>
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
