import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { ContentPage } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { Panel } from "../components/DashboardShell";
import { AdminDashboardShell as DashboardShell } from "../components/AdminDashboardShell";
import {
  FilterSelect,
  ListToolbar,
  Pagination,
  SearchField,
} from "../components/ListControls";
import { RichEditor } from "../components/RichEditor";
import { RichText } from "../components/RichText";
import { EmptyState, PageLoader, StatusBadge } from "../components/ui";
import { matchesSearch, paginate, useListControls } from "../lib/list";

export const Route = createFileRoute("/admin/content")({
  component: AdminContentPage,
});

const emptyForm = {
  slug: "",
  titleEn: "",
  titleDe: "",
  excerptEn: "",
  excerptDe: "",
  bodyEn: "",
  bodyDe: "",
  status: "DRAFT",
};

function AdminContentPage() {
  const { t, pick, formatDate } = useI18n();
  const nav = useAdminNav();
  const queryClient = useQueryClient();
  const controls = useListControls();
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<ContentPage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const pagesQuery = useQuery({
    queryKey: ["admin", "content"],
    queryFn: () => api<{ pages: ContentPage[] }>("/admin/content"),
  });

  const pages = pagesQuery.data?.pages ?? [];

  const filteredPages = pages.filter(
    (page) =>
      (!controls.status || page.status === controls.status) &&
      matchesSearch(controls.search, page.titleEn, page.titleDe, page.slug),
  );

  const pageData = paginate(filteredPages, controls.page, controls.pageSize);

  function startNew() {
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function edit(page: ContentPage) {
    setEditingId(page.id);
    setForm({
      slug: page.slug,
      titleEn: page.titleEn,
      titleDe: page.titleDe,
      excerptEn: page.excerptEn ?? "",
      excerptDe: page.excerptDe ?? "",
      bodyEn: page.bodyEn,
      bodyDe: page.bodyDe,
      status: page.status,
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (editingId) {
        await api(`/admin/content/${editingId}`, {
          method: "PATCH",
          body: form,
        });
      } else {
        await api("/admin/content", { method: "POST", body: form });
      }
      setMessage(t("admin.pageSaved"));
      setForm(null);
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "content"] });
      await queryClient.invalidateQueries({ queryKey: ["content"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t("admin.deleteConfirm"))) return;
    try {
      await api(`/admin/content/${id}`, { method: "DELETE" });
      setMessage(t("admin.pageDeleted"));
      await queryClient.invalidateQueries({ queryKey: ["admin", "content"] });
      await queryClient.invalidateQueries({ queryKey: ["content"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("admin.contentTitle")}
      subtitle={t("admin.content")}
      actions={
        <Button
          onClick={startNew}
          className={cn(
            " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
          )}
        >
          <Plus className="h-4 w-4" /> {t("admin.newPage")}
        </Button>
      }
    >
      {message && (
        <Alert
          className={cn(
            "flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-success text-success-content border-success mb-4 text-sm",
          )}
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert
          className={cn(
            "flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-error text-error-content border-error mb-4 text-sm",
          )}
        >
          {error}
        </Alert>
      )}

      {form && (
        <form
          onSubmit={save}
          className="mb-5 rounded-box border border-base-300 bg-base-100 p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">
              {editingId ? t("admin.editPage") : t("admin.newPage")}
            </h2>
            <Button
              type="button"
              onClick={() => setForm(null)}
              className={cn(
                " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
              )}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.slug")}
              </span>
              <Input
                required
                pattern="[a-z0-9-]+"
                value={form.slug}
                onChange={(event) =>
                  setForm({ ...form, slug: event.target.value })
                }
                className={cn(" h-8 text-xs w-full")}
                placeholder="network-upgrade-signs"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.status")}
              </span>
              <NativeSelect
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
                className={cn(" h-8 text-xs w-full")}
              >
                <option value="DRAFT">{t("admin.draft")}</option>
                <option value="PUBLISHED">{t("admin.publish")}</option>
              </NativeSelect>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.titleEn")}
              </span>
              <Input
                required
                value={form.titleEn}
                onChange={(event) =>
                  setForm({ ...form, titleEn: event.target.value })
                }
                className={cn(" h-8 text-xs w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.titleDe")}
              </span>
              <Input
                required
                value={form.titleDe}
                onChange={(event) =>
                  setForm({ ...form, titleDe: event.target.value })
                }
                className={cn(" h-8 text-xs w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.excerptEn")}
              </span>
              <Textarea
                rows={2}
                value={form.excerptEn}
                onChange={(event) =>
                  setForm({ ...form, excerptEn: event.target.value })
                }
                className={cn(" w-full text-sm")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.excerptDe")}
              </span>
              <Textarea
                rows={2}
                value={form.excerptDe}
                onChange={(event) =>
                  setForm({ ...form, excerptDe: event.target.value })
                }
                className={cn(" w-full text-sm")}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold">{t("admin.bodyEn")}</p>
              <RichEditor
                value={form.bodyEn}
                onChange={(html) => setForm({ ...form, bodyEn: html })}
                placeholder="Write the English article…"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold">{t("admin.bodyDe")}</p>
              <RichEditor
                value={form.bodyDe}
                onChange={(html) => setForm({ ...form, bodyDe: html })}
                placeholder="Deutschen Artikel schreiben…"
              />
            </div>
          </div>

          <Button
            disabled={busy}
            className={cn(
              " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm mt-4",
            )}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("admin.save")}
          </Button>
        </form>
      )}

      {preview && (
        <Panel
          title={pick(preview.titleEn, preview.titleDe)}
          action={
            <Button
              onClick={() => setPreview(null)}
              className={cn(
                " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
              )}
            >
              <X className="h-4 w-4" /> {t("common.close")}
            </Button>
          }
          className="mb-5"
        >
          <RichText html={pick(preview.bodyEn, preview.bodyDe)} />
        </Panel>
      )}

      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchContent")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={[
            { value: "PUBLISHED", label: t("admin.published") },
            { value: "DRAFT", label: t("admin.draft") },
          ]}
          allLabel={t("common.all")}
          ariaLabel={t("admin.status")}
        />
      </ListToolbar>

      {pagesQuery.isLoading && <PageLoader />}
      {!pagesQuery.isLoading && pageData.total === 0 && (
        <div className="mt-5">
          <EmptyState title={t("blog.noPosts")} />
        </div>
      )}

      {pageData.total > 0 && (
        <div className="mt-5 overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <Table className={cn(" [&_tbody_tr:nth-child(even)]:bg-base-200")}>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.title")}</TableHead>
                <TableHead>{t("admin.slug")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.items.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-semibold">
                    {pick(page.titleEn, page.titleDe)}
                  </TableCell>
                  <TableCell className="tabular-nums text-xs">
                    {page.slug}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={page.status} />
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDate(page.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => setPreview(page)}
                        className={cn(
                          " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                        )}
                        title={t("admin.preview")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {page.status === "PUBLISHED" && (
                        <Link
                          to="/blog/$slug"
                          params={{ slug: page.slug }}
                          className={cn(
                            buttonVariants(),
                            " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                          )}
                          title={t("common.open")}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      <Button
                        onClick={() => edit(page)}
                        className={cn(
                          " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                        )}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => void remove(page.id)}
                        className={cn(
                          " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs text-error",
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
