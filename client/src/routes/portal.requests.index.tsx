import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { api } from "../lib/api";
import type { ServiceRequest } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { CustomerPortalShell as DashboardShell } from "../components/CustomerPortalShell";
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

export const Route = createFileRoute("/portal/requests/")({
  component: RequestsPage,
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

function RequestsPage() {
  const { t, pick, formatDate, formatMoney } = useI18n();
  const nav = usePortalNav();
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
          request.service?.nameEn,
          request.service?.nameDe,
        ),
    ),
    controls.archive,
    (request) => archivedStatuses.has(request.status),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  return (
    <DashboardShell
      nav={nav}
      title={t("requests.title")}
      subtitle={t("requests.text")}
      actions={
        <Link
          to="/quote"
          search={{ service: undefined }}
          className={cn(
            buttonVariants(),
            " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
          )}
        >
          <Plus className="h-4 w-4" /> {t("requests.new")}
        </Link>
      }
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
          <EmptyState
            title={t("requests.noQuotes")}
            text={t("requests.text")}
            action={
              <Link
                to="/quote"
                search={{ service: undefined }}
                className={cn(
                  buttonVariants(),
                  " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
                )}
              >
                {t("requests.new")}
              </Link>
            }
          />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <Table className={cn(" [&_tbody_tr:nth-child(even)]:bg-base-200")}>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.reference")}</TableHead>
                <TableHead>{t("common.title")}</TableHead>
                <TableHead>{t("requests.service")}</TableHead>
                <TableHead>{t("requests.createdAt")}</TableHead>
                <TableHead>{t("requests.budget")}</TableHead>
                <TableHead>{t("requests.status")}</TableHead>
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
                      {request.technician?.fullName ?? t("requests.unassigned")}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs">
                    {request.service
                      ? pick(request.service.nameEn, request.service.nameDe)
                      : "–"}
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
                      to="/portal/requests/$id"
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
