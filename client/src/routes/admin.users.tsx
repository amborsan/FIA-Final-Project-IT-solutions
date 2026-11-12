import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, UserPlus, X } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { User } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { AdminDashboardShell as DashboardShell } from "../components/AdminDashboardShell";
import {
  FilterSelect,
  ListToolbar,
  Pagination,
  SearchField,
} from "../components/ListControls";
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
      matchesSearch(
        controls.search,
        user.fullName,
        user.email,
        user.companyName,
      ),
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
        <Button
          onClick={() => setShowForm((value) => !value)}
          className={cn(
            " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
          )}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {t("admin.addUser")}
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

      {showForm && (
        <form
          onSubmit={createUser}
          className="mb-5 rounded-box border border-base-300 bg-base-100 p-6"
        >
          <h2 className="flex items-center gap-2 text-base font-medium">
            <UserPlus className="h-4 w-4" /> {t("admin.newUser")}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.firstName")}
              </span>
              <Input
                required
                value={form.firstName}
                onChange={(event) =>
                  setForm({ ...form, firstName: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.lastName")}
              </span>
              <Input
                required
                value={form.lastName}
                onChange={(event) =>
                  setForm({ ...form, lastName: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("common.email")}
              </span>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.password")}
              </span>
              <Input
                required
                type="password"
                minLength={10}
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.role")}
              </span>
              <NativeSelect
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value })
                }
                className={cn(" w-full")}
              >
                <option value="CUSTOMER">{t("admin.roleCustomer")}</option>
                <option value="TECHNICIAN">{t("admin.roleTechnician")}</option>
                <option value="ADMIN">{t("admin.roleAdmin")}</option>
              </NativeSelect>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.phone")}
              </span>
              <Input
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("admin.company")}
              </span>
              <Input
                value={form.companyName}
                onChange={(event) =>
                  setForm({ ...form, companyName: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("common.address")}
              </span>
              <Input
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
                className={cn(" w-full")}
              />
            </label>
          </div>
          <Button
            disabled={loading}
            className={cn(
              " bg-primary text-primary-content border-primary hover:bg-primary-hover mt-4",
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.create")}
          </Button>
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
          <Table className={cn(" [&_tbody_tr:nth-child(even)]:bg-base-200")}>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.email")}</TableHead>
                <TableHead>{t("admin.company")}</TableHead>
                <TableHead>{t("admin.role")}</TableHead>
                <TableHead>{t("common.created")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-semibold">
                    {user.fullName}
                  </TableCell>
                  <TableCell className="text-xs">{user.email}</TableCell>
                  <TableCell className="text-xs">
                    {user.companyName || "–"}
                  </TableCell>
                  <TableCell>
                    <NativeSelect
                      value={user.role}
                      onChange={(event) =>
                        void updateRole(user.id, event.target.value)
                      }
                      className={cn(" h-6 px-2 text-xs")}
                    >
                      <option value="CUSTOMER">
                        {t("admin.roleCustomer")}
                      </option>
                      <option value="TECHNICIAN">
                        {t("admin.roleTechnician")}
                      </option>
                      <option value="ADMIN">{t("admin.roleAdmin")}</option>
                    </NativeSelect>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => void deactivate(user.id)}
                      className={cn(
                        " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs text-error",
                      )}
                    >
                      {t("admin.deactivate")}
                    </Button>
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
