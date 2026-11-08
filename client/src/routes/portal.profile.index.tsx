import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Download, KeyRound, Loader2, ShieldAlert, Trash2, UserRound } from "lucide-react";
import { api, downloadFile, errorMessage } from "../lib/api";
import type { Notification, ProfileResponse } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { DashboardShell, Panel } from "../components/DashboardShell";
import { PageLoader } from "../components/ui";

export const Route = createFileRoute("/portal/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, setUser } = useAuth();
  const { t, formatDateTime, language, setLanguage } = useI18n();
  const nav = usePortalNav();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => api<ProfileResponse>("/profile"),
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<{ notifications: Notification[] }>("/notifications"),
  });

  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    companyName: user?.companyName ?? "",
    address: user?.address ?? "",
    preferredLanguage: user?.preferredLanguage ?? "EN",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteWord, setDeleteWord] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const notifications = notificationsQuery.data?.notifications ?? [];

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
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  async function deleteAccount() {
    if (deleteWord !== "DELETE") {
      setError(t("portal.deleteConfirm"));
      return;
    }
    if (!window.confirm(t("portal.deleteConfirm"))) return;
    setBusy("delete");
    setError("");
    try {
      await api("/privacy/account", {
        method: "DELETE",
        body: { password: deletePassword },
      });
      setUser(null);
      queryClient.clear();
      await navigate({ to: "/" });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy("");
    }
  }

  if (profileQuery.isLoading) {
    return (
      <DashboardShell nav={nav} title={t("portal.profileTitle")}>
        <PageLoader />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell nav={nav} title={t("portal.profileTitle")} subtitle={t("portal.profileText")}>
      {message && <div role="status" className="ds-alert ds-alert-success mb-4 text-sm">{message}</div>}
      {error && <div role="alert" className="ds-alert ds-alert-error mb-4 text-sm">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={t("portal.profileTitle")}>
          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">{t("common.name")}</span>
              <input
                required
                value={profile.fullName}
                onChange={(event) => setProfile({ ...profile, fullName: event.target.value })}
                className="ds-input ds-input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("common.phone")}</span>
              <input
                value={profile.phone}
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                className="ds-input ds-input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("portal.companyName")}</span>
              <input
                value={profile.companyName}
                onChange={(event) => setProfile({ ...profile, companyName: event.target.value })}
                className="ds-input ds-input-bordered w-full"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">{t("common.address")}</span>
              <input
                value={profile.address}
                onChange={(event) => setProfile({ ...profile, address: event.target.value })}
                className="ds-input ds-input-bordered w-full"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">{t("portal.language")}</span>
              <select
                value={profile.preferredLanguage}
                onChange={(event) =>
                  setProfile({ ...profile, preferredLanguage: event.target.value as "EN" | "DE" })
                }
                className="ds-select ds-select-bordered w-full"
              >
                <option value="EN">English</option>
                <option value="DE">Deutsch</option>
              </select>
            </label>
            <div className="sm:col-span-2">
              <button disabled={busy === "profile"} className="ds-btn ds-btn-primary ds-btn-sm">
                {busy === "profile" && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("portal.saveProfile")}
              </button>
            </div>
          </form>
        </Panel>

        <Panel title={t("portal.passwordTitle")} text={t("portal.passwordText")}>
          <form onSubmit={changePassword} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("portal.currentPassword")}</span>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={(event) =>
                  setPasswords({ ...passwords, currentPassword: event.target.value })
                }
                className="ds-input ds-input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("portal.newPassword")}</span>
              <input
                required
                type="password"
                minLength={10}
                autoComplete="new-password"
                value={passwords.newPassword}
                onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                className="ds-input ds-input-bordered w-full"
              />
              <span className="mt-1 block text-[11px] text-base-content/70">{t("auth.passwordHint")}</span>
            </label>
            <button disabled={busy === "password"} className="ds-btn ds-btn-primary ds-btn-sm">
              <KeyRound className="h-4 w-4" />
              {t("portal.updatePassword")}
            </button>
          </form>
        </Panel>

        <Panel
          title={t("portal.notifications")}
          action={
            <button onClick={markAllRead} className="ds-link ds-link-primary text-xs">
              {t("portal.markAllRead")}
            </button>
          }
        >
          {notifications.length === 0 && (
            <p className="py-4 text-center text-xs text-base-content/70">
              {t("portal.noNotifications")}
            </p>
          )}
          <div className="space-y-2">
            {notifications.slice(0, 8).map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-3 ${
                  notification.readAt ? "border-base-200" : "border-primary/20 bg-primary/5"
                }`}
              >
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <Bell className="h-3.5 w-3.5" /> {notification.title}
                </p>
                <p className="mt-1 text-[11px] text-base-content/65">{notification.message}</p>
                <p className="mt-1 text-[10px] text-base-content/65">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={t("portal.privacyTitle")} text={t("portal.privacyText")}>
          <div className="space-y-4">
            <div className="rounded-lg border border-base-300 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Download className="h-4 w-4 text-primary" /> {t("portal.exportData")}
              </p>
              <p className="mt-1 text-xs text-base-content/65">{t("portal.exportText")}</p>
              <button
                onClick={() => void downloadFile("/privacy/export", "orbit-data.json")}
                className="ds-btn ds-btn-outline ds-btn-xs mt-2"
              >
                {t("common.download")}
              </button>
            </div>

            <div className="rounded-lg border border-error/30 bg-error/5 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-error">
                <ShieldAlert className="h-4 w-4" /> {t("portal.deleteAccount")}
              </p>
              <p className="mt-1 text-xs text-base-content/65">{t("portal.deleteText")}</p>
              <div className="mt-3 space-y-2">
                <input
                  type="password"
                  placeholder={t("portal.deletePassword")}
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  className="ds-input ds-input-bordered ds-input-sm w-full"
                />
                <input
                  placeholder={t("portal.deleteConfirm")}
                  value={deleteWord}
                  onChange={(event) => setDeleteWord(event.target.value)}
                  className="ds-input ds-input-bordered ds-input-sm w-full"
                />
                <button
                  onClick={deleteAccount}
                  disabled={busy === "delete" || deleteWord !== "DELETE"}
                  className="ds-btn ds-btn-error ds-btn-xs"
                >
                  {busy === "delete" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  {t("portal.deleteButton")}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-base-content/70">
              <UserRound className="h-3.5 w-3.5" />
              {profileQuery.data?.user.email}
            </div>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
