import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { errorMessage } from "../lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

export default function RegisterPage() {
  const { user, register } = useAuth();
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) void navigate({ to: "/portal" });
  }, [user, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        companyName: form.companyName,
        preferredLanguage: language === "de" ? "DE" : "EN",
        acceptTerms: form.acceptTerms,
        acceptPrivacy: form.acceptPrivacy,
      });
      await navigate({ to: "/portal" });
    } catch (caught) {
      setError(errorMessage(caught, t("auth.genericError")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hero-grid min-h-[80vh] py-12">
      <div className="container-page max-w-2xl">
        <div className="rounded-box border border-base-300 bg-base-100 p-6 shadow-lg sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-content">
            <UserPlus className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">{t("auth.registerTitle")}</h1>
          <p className="mt-1 text-sm text-base-content/70">{t("auth.registerText")}</p>

          <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("auth.firstName")}</span>
              <input
                required
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                className="input input-bordered w-full"
                autoComplete="given-name"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("auth.lastName")}</span>
              <input
                required
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                className="input input-bordered w-full"
                autoComplete="family-name"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">{t("auth.email")}</span>
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("auth.password")}</span>
              <input
                required
                type="password"
                minLength={10}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="input input-bordered w-full"
              />
              <span className="mt-1 block text-[11px] text-base-content/70">{t("auth.passwordHint")}</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("auth.confirmPassword")}</span>
              <input
                required
                type="password"
                minLength={10}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("auth.phone")}</span>
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="input input-bordered w-full"
                autoComplete="tel"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">{t("auth.company")}</span>
              <input
                value={form.companyName}
                onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                className="input input-bordered w-full"
                autoComplete="organization"
              />
            </label>

            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-base-content/65 sm:col-span-2">
              <input
                type="checkbox"
                required
                checked={form.acceptTerms}
                onChange={(event) => setForm({ ...form, acceptTerms: event.target.checked })}
                className="checkbox checkbox-sm mt-0.5"
              />
              <span>
                {t("auth.acceptTerms")}{" "}
                <Link to="/legal/terms" className="link link-primary">
                  {t("footer.terms")}
                </Link>
              </span>
            </label>
            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-base-content/65 sm:col-span-2">
              <input
                type="checkbox"
                required
                checked={form.acceptPrivacy}
                onChange={(event) => setForm({ ...form, acceptPrivacy: event.target.checked })}
                className="checkbox checkbox-sm mt-0.5"
              />
              <span>
                {t("auth.acceptPrivacy")}{" "}
                <Link to="/legal/privacy" className="link link-primary">
                  {t("footer.privacy")}
                </Link>
              </span>
            </label>

            {error && <div className="alert alert-error py-2 text-sm sm:col-span-2">{error}</div>}

            <div className="sm:col-span-2">
              <button disabled={loading} className="btn btn-primary w-full sm:w-auto">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("auth.registerButton")}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-base-content/65">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="link link-primary font-semibold">
              {t("auth.loginButton")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
