import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Bell, Download, KeyRound, Loader2, UserRound } from "lucide-react";
import { api, downloadFile, errorMessage } from "../lib/api";
import type { Activity as ActivityEntry, Notification, ProfileResponse } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { RequireRole } from "../components/RequireRole";
import { PageLoader } from "../components/ui";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  return (
    <RequireRole roles={["CUSTOMER", "TECHNICIAN", "ADMIN"]}>
      <AccountContent />
    </RequireRole>
  );
}

function AccountContent() {
  const { user, setUser } = useAuth();
  const { t, language, setLanguage, formatDateTime } = useI18n();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    companyName: user?.companyName ?? "",
    address: user?.address ?? "",
    preferredLanguage: user?.preferredLanguage ?? "EN",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => api<ProfileResponse>("/profile"),
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<{ notifications: Notification[] }>("/notifications"),
  });
  const activityQuery = useQuery({
    queryKey: ["profile", "activity"],
    queryFn: () => api<{ activity: ActivityEntry[] }>("/profile/activity"),
  });

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setBusy("profile");
    setMessage("");
    setError("");
    try {
      const data = await api<{ user: typeof user }>("/profile", {
        method: "PATCH",
        body: profile,
      });
      if (data.user) setUser(data.user);
      if (profile.preferredLanguage !== (language === "de" ? "DE" : "EN")) {
        setLanguage(profile.preferredLanguage === "DE" ? "de" : "en");
      }
      setMessage(t("portal.profileSaved"));
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy("");
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy("password");
    setMessage("");
    setError("");
    try {
      await api("/profile/password", { method: "POST", body: passwords });
      setPasswords({ currentPassword: "", newPassword: "" });
      setMessage(t("portal.passwordUpdated"));
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy("");
    }
  }

  async function markAllRead() {
    await api("/notifications/read-all", { method: "PATCH" });
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  if (profileQuery.isLoading) return <PageLoader />;

  const notifications = notificationsQuery.data?.notifications ?? [];
  const activity = activityQuery.data?.activity ?? [];

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5" /> {t("nav.account")}
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            {profileQuery.data?.user.fullName}
          </h1>
          <p className="mt-1 text-sm text-base-content/65">
            {profileQuery.data?.user.email} ·{" "}
            <span className="badge badge-ghost badge-sm">
              {user ? t(`role.${user.role}` as "role.ADMIN") : ""}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void downloadFile("/privacy/export", "orbit-data.json")}
            className="btn btn-outline btn-sm"
          >
            <Download className="h-4 w-4" /> {t("portal.exportData")}
          </button>
          {user?.role === "CUSTOMER" && (
            <a href="/portal/profile" className="btn btn-ghost btn-sm">
              {t("portal.privacyTitle")}
            </a>
          )}
        </div>
      </div>

      {message && <div className="alert alert-success mt-4 text-sm">{message}</div>}
      {error && <div className="alert alert-error mt-4 text-sm">{error}</div>}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="text-base font-bold">{t("portal.profileTitle")}</h2>
          <form onSubmit={saveProfile} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">{t("common.name")}</span>
              <input
                required
                value={profile.fullName}
                onChange={(event) => setProfile({ ...profile, fullName: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("common.phone")}</span>
              <input
                value={profile.phone}
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("portal.companyName")}</span>
              <input
                value={profile.companyName}
                onChange={(event) => setProfile({ ...profile, companyName: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">{t("common.address")}</span>
              <input
                value={profile.address}
                onChange={(event) => setProfile({ ...profile, address: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">{t("portal.language")}</span>
              <select
                value={profile.preferredLanguage}
                onChange={(event) =>
                  setProfile({ ...profile, preferredLanguage: event.target.value as "EN" | "DE" })
                }
                className="select select-bordered w-full"
              >
                <option value="EN">English</option>
                <option value="DE">Deutsch</option>
              </select>
            </label>
            <div className="sm:col-span-2">
              <button disabled={busy === "profile"} className="btn btn-primary btn-sm">
                {busy === "profile" && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("portal.saveProfile")}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="text-base font-bold">{t("portal.passwordTitle")}</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("portal.currentPassword")}</span>
              <input
                required
                type="password"
                value={passwords.currentPassword}
                onChange={(event) =>
                  setPasswords({ ...passwords, currentPassword: event.target.value })
                }
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("portal.newPassword")}</span>
              <input
                required
                type="password"
                minLength={10}
                value={passwords.newPassword}
                onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <button disabled={busy === "password"} className="btn btn-primary btn-sm">
              <KeyRound className="h-4 w-4" />
              {t("portal.updatePassword")}
            </button>
          </form>
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Bell className="h-4 w-4 text-primary" /> {t("portal.notifications")}
            </h2>
            <button onClick={markAllRead} className="link link-primary text-xs">
              {t("portal.markAllRead")}
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {notifications.length === 0 && (
              <p className="py-4 text-center text-xs text-base-content/60">
                {t("portal.noNotifications")}
              </p>
            )}
            {notifications.slice(0, 8).map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-3 ${
                  notification.readAt ? "border-base-200" : "border-primary/20 bg-primary/5"
                }`}
              >
                <p className="text-xs font-semibold">{notification.title}</p>
                <p className="mt-0.5 text-[11px] text-base-content/65">{notification.message}</p>
                <p className="mt-1 text-[10px] text-base-content/50">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Activity className="h-4 w-4 text-primary" /> {t("portal.activity")}
          </h2>
          <div className="mt-3 space-y-2">
            {activity.length === 0 && (
              <p className="py-4 text-center text-xs text-base-content/60">
                {t("portal.noActivity")}
              </p>
            )}
            {activity.slice(0, 10).map((entry) => (
              <div key={entry.id} className="rounded-lg bg-base-200/60 p-2.5">
                <p className="text-xs">{entry.description}</p>
                <p className="text-[10px] text-base-content/50">
                  {formatDateTime(entry.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
