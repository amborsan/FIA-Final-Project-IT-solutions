import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Eye, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { ContentPage } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { DashboardShell, Panel } from "../components/DashboardShell";
import { RichEditor } from "../components/RichEditor";
import { RichText } from "../components/RichText";
import { EmptyState, PageLoader, StatusBadge } from "../components/ui";

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
        await api(`/admin/content/${editingId}`, { method: "PATCH", body: form });
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
        <button onClick={startNew} className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" /> {t("admin.newPage")}
        </button>
      }
    >
      {message && <div className="alert alert-success mb-4 text-sm">{message}</div>}
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      {form && (
        <form onSubmit={save} className="mb-5 rounded-box border border-base-300 bg-base-100 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">
              {editingId ? t("admin.editPage") : t("admin.newPage")}
            </h2>
            <button type="button" onClick={() => setForm(null)} className="btn btn-ghost btn-xs">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.slug")}</span>
              <input
                required
                pattern="[a-z0-9-]+"
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                className="input input-bordered input-sm w-full"
                placeholder="network-upgrade-signs"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.status")}</span>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                className="select select-bordered select-sm w-full"
              >
                <option value="DRAFT">{t("admin.draft")}</option>
                <option value="PUBLISHED">{t("admin.publish")}</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.titleEn")}</span>
              <input
                required
                value={form.titleEn}
                onChange={(event) => setForm({ ...form, titleEn: event.target.value })}
                className="input input-bordered input-sm w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.titleDe")}</span>
              <input
                required
                value={form.titleDe}
                onChange={(event) => setForm({ ...form, titleDe: event.target.value })}
                className="input input-bordered input-sm w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.excerptEn")}</span>
              <textarea
                rows={2}
                value={form.excerptEn}
                onChange={(event) => setForm({ ...form, excerptEn: event.target.value })}
                className="textarea textarea-bordered w-full text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.excerptDe")}</span>
              <textarea
                rows={2}
                value={form.excerptDe}
                onChange={(event) => setForm({ ...form, excerptDe: event.target.value })}
                className="textarea textarea-bordered w-full text-sm"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
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

          <button disabled={busy} className="btn btn-primary btn-sm mt-4">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("admin.save")}
          </button>
        </form>
      )}

      {preview && (
        <Panel
          title={pick(preview.titleEn, preview.titleDe)}
          action={
            <button onClick={() => setPreview(null)} className="btn btn-ghost btn-xs">
              <X className="h-4 w-4" /> {t("common.close")}
            </button>
          }
          className="mb-5"
        >
          <RichText html={pick(preview.bodyEn, preview.bodyDe)} />
        </Panel>
      )}

      {pagesQuery.isLoading && <PageLoader />}
      {!pagesQuery.isLoading && pages.length === 0 && <EmptyState title={t("blog.noPosts")} />}

      <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>{t("common.title")}</th>
              <th>{t("admin.slug")}</th>
              <th>{t("common.status")}</th>
              <th>{t("common.date")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="font-semibold">{pick(page.titleEn, page.titleDe)}</td>
                <td className="font-mono text-[11px]">{page.slug}</td>
                <td>
                  <StatusBadge status={page.status} />
                </td>
                <td className="text-xs">{formatDate(page.updatedAt)}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setPreview(page)} className="btn btn-ghost btn-xs" title={t("admin.preview")}>
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {page.status === "PUBLISHED" && (
                      <Link
                        to="/blog/$slug"
                        params={{ slug: page.slug }}
                        className="btn btn-ghost btn-xs"
                        title={t("common.open")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    <button onClick={() => edit(page)} className="btn btn-ghost btn-xs">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => void remove(page.id)} className="btn btn-ghost btn-xs text-error">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
