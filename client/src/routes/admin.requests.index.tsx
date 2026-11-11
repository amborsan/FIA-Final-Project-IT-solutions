import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import type { ServiceRequest } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { AdminDashboardShell as DashboardShell } from "../components/AdminDashboardShell";
import {
  ArchiveTabs,
  FilterSelect,
  ListToolbar,
  Pagination,
  SearchField,
} from "../components/ListControls";
import {
  EmptyState,
  ErrorState,
  PageLoader,
  StatusBadge,
} from "../components/ui";
import {
  filterByArchive,
  matchesSearch,
  paginate,
  useListControls,
} from "../lib/list";

export const Route = createFileRoute("/admin/requests/")({
  component: AdminRequestsPage,
});

const requestStatuses = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "APPROVED",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const archivedStatuses = new Set(["COMPLETED", "CANCELLED"]);

function AdminRequestsPage() {
  const { t, pick, formatDate, formatMoney } = useI18n();
  const nav = useAdminNav();
  const controls = useListControls();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["requests"],
    queryFn: () => api<{ requests: ServiceRequest[] }>("/requests"),
  });

  const requests = data?.requests ?? [];

  const filtered = filterByArchive(
    requests.filter(
      (request) =>
        (!controls.status || request.status === controls.status) &&
        matchesSearch(
          controls.search,
          request.reference,
          request.title,
          request.contactName,
          request.contactEmail,
          request.customer?.fullName,
        ),
    ),
    controls.archive,
    (request) => archivedStatuses.has(request.status),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  return (
    <DashboardShell
      nav={nav}
      title={t("admin.requests")}
      subtitle={t("requests.text")}
    >
      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchRequests")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={requestStatuses.map((value) => ({
            value,
            label: t(`status.${value}` as "status.NEW"),
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
          <EmptyState title={t("admin.noResults")} />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <Table className={cn(" [&_tbody_tr:nth-child(even)]:bg-base-200")}>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.reference")}</TableHead>
                <TableHead>{t("common.title")}</TableHead>
                <TableHead>{t("common.customer")}</TableHead>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("requests.budget")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.items.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="tabular-nums text-xs">
                    {request.reference}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-56 truncate font-semibold">
                      {request.title}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {request.service
                        ? pick(request.service.nameEn, request.service.nameDe)
                        : "–"}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs">
                    {request.customer?.fullName || request.contactName}
                    <br />
                    <span className="text-xs text-ink-muted">
                      {request.contactEmail}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDate(request.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {request.budget ? formatMoney(request.budget) : "–"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/admin/requests/$id"
                      params={{ id: request.id }}
                      className={cn(
                        buttonVariants(),
                        " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                      )}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
