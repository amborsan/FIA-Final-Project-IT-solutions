import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, UserPlus, X } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { User } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { FilterSelect, ListToolbar, Pagination, SearchField } from "../components/ListControls";
import { EmptyState, ErrorState, PageLoader } from "../components/ui";
import { matchesSearch, paginate, useListControls } from "../lib/list";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "CUSTOMER",
  phone: "",
  companyName: "",
  address: "",
};

function AdminUsersPage() {
  const { t, formatDate } = useI18n();
  const nav = useAdminNav();
  const queryClient = useQueryClient();
  const controls = useListControls();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api<{ users: User[] }>("/admin/users"),
  });

  const users = data?.users ?? [];

  const filtered = users.filter(
    (user) =>
      (!controls.status || user.role === controls.status) &&
      matchesSearch(controls.search, user.fullName, user.email, user.companyName),
  );

  const pageData = paginate(filtered, controls.page, controls.pageSize);

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api("/admin/users", { method: "POST", body: form });
      setForm(emptyForm);
      setShowForm(false);
      setMessage(t("admin.userCreated"));
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(id: string, role: string) {
    setError("");
    try {
      await api(`/admin/users/${id}`, { method: "PATCH", body: { role } });
      setMessage(t("admin.userUpdated"));
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  async function deactivate(id: string) {
    if (!window.confirm(t("admin.deactivate") + "?")) return;
    try {
      await api(`/admin/users/${id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("admin.users")}
      subtitle={t("admin.manageUsers")}
      actions={
        <button onClick={() => setShowForm((value) => !value)} className="btn btn-primary btn-sm">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {t("admin.addUser")}
        </button>
      }
    >
      {message && <div className="alert alert-success mb-4 text-sm">{message}</div>}
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={createUser} className="mb-5 rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <UserPlus className="h-4 w-4" /> {t("admin.newUser")}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.firstName")}</span>
              <input
                required
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.lastName")}</span>
              <input
                required
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("common.email")}</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.password")}</span>
              <input
                required
                type="password"
                minLength={10}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.role")}</span>
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                className="select select-bordered w-full"
              >
                <option value="CUSTOMER">{t("admin.roleCustomer")}</option>
                <option value="TECHNICIAN">{t("admin.roleTechnician")}</option>
                <option value="ADMIN">{t("admin.roleAdmin")}</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.phone")}</span>
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("admin.company")}</span>
              <input
                value={form.companyName}
                onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("common.address")}</span>
              <input
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
          </div>
          <button disabled={loading} className="btn btn-primary mt-4">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.create")}
          </button>
        </form>
      )}

      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchUsers")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={[
            { value: "CUSTOMER", label: t("admin.roleCustomer") },
            { value: "TECHNICIAN", label: t("admin.roleTechnician") },
            { value: "ADMIN", label: t("admin.roleAdmin") },
          ]}
          allLabel={t("common.all")}
          ariaLabel={t("admin.role")}
        />
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
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>{t("common.name")}</th>
                <th>{t("common.email")}</th>
                <th>{t("admin.company")}</th>
                <th>{t("admin.role")}</th>
                <th>{t("common.created")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pageData.items.map((user) => (
                <tr key={user.id}>
                  <td className="font-semibold">{user.fullName}</td>
                  <td className="text-xs">{user.email}</td>
                  <td className="text-xs">{user.companyName || "–"}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(event) => void updateRole(user.id, event.target.value)}
                      className="select select-bordered select-xs"
                    >
                      <option value="CUSTOMER">{t("admin.roleCustomer")}</option>
                      <option value="TECHNICIAN">{t("admin.roleTechnician")}</option>
                      <option value="ADMIN">{t("admin.roleAdmin")}</option>
                    </select>
                  </td>
                  <td className="text-xs">{formatDate(user.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => void deactivate(user.id)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      {t("admin.deactivate")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
