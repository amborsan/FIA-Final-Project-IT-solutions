import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { PageLoader } from "./ui";
import type { Role } from "../lib/types";

/**
 * Wraps portal pages and redirects visitors to the login page.
 * If a logged-in user has the wrong role we show a friendly message instead
 * of exposing the page.
 */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading) return <PageLoader />;
  if (!user) return <PageLoader />;

  if (!allowed) {
    const dashboard =
      user.role === "ADMIN" ? "/admin" : user.role === "TECHNICIAN" ? "/technician" : "/portal";
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-warning" />
          <h1 className="mt-4 text-2xl font-bold">{t("forbidden.title")}</h1>
          <p className="mt-2 text-base-content/70">{t("forbidden.text")}</p>
          <a href={dashboard} className="ds-btn ds-btn-primary mt-6">
            {t("forbidden.back")}
          </a>
        </div>
      </div>
    );
  }

  return children;
}
