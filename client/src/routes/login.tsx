import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { errorMessage } from "../lib/api";

const demos = [
  {
    label: "auth.demoAdmin",
    email: "admin@fia-it.de",
    password: "Admin12345!",
  },
  { label: "auth.demoTech", email: "tech@fia-it.de", password: "Tech12345!" },
  {
    label: "auth.demoCustomer",
    email: "customer@fia-it.de",
    password: "Customer12345!",
  },
  {
    label: "auth.demoBusiness",
    email: "business@fia-it.de",
    password: "Customer12345!",
  },
] as const;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

export default function LoginPage() {
  const { user, login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      const to =
        user.role === "ADMIN"
          ? "/admin"
          : user.role === "TECHNICIAN"
            ? "/technician"
            : "/portal";
      void navigate({ to });
    }
  }, [user, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const account = await login({ email, password });
      const to =
        account.role === "ADMIN"
          ? "/admin"
          : account.role === "TECHNICIAN"
            ? "/technician"
            : "/portal";
      await navigate({ to });
    } catch (caught) {
      setError(errorMessage(caught, t("auth.invalid")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hero-grid flex min-h-[80vh] items-center py-12">
      <div className="container-page grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="mx-auto w-full max-w-md rounded-box border border-base-300 bg-base-100 p-6 shadow-lg sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-content">
            <LogIn className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">{t("auth.loginTitle")}</h1>
          <p className="mt-1 text-sm text-base-content/70">
            {t("auth.loginText")}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("auth.email")}
              </span>
              <Input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("auth.password")}
              </span>
              <Input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={cn(" w-full")}
              />
            </label>
            {error && (
              <Alert className={cn("flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-error text-error-content border-error py-2 text-sm")}>{error}</Alert>
            )}
            <Button disabled={loading} className={cn(" bg-primary text-primary-content border-primary hover:bg-primary-hover w-full")}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("auth.loginButton")}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-base-content/65">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className={cn("underline cursor-pointer text-primary font-semibold")}>
              {t("auth.registerButton")}
            </Link>
          </p>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-base-content/70">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure session · CSRF
            protected
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-box border border-base-300 bg-base-100/80 p-6 backdrop-blur">
            <h2 className="text-base font-bold">{t("auth.demoTitle")}</h2>
            <p className="mt-1 text-xs text-base-content/65">
              {t("auth.demoText")}
            </p>
            <div className="mt-4 grid gap-2">
              {demos.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => {
                    setEmail(demo.email);
                    setPassword(demo.password);
                  }}
                  className="flex items-center justify-between gap-2 rounded-lg border border-base-300 px-3 py-2.5 text-left transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span>
                    <span className="block text-xs font-semibold">
                      {t(demo.label)}
                    </span>
                    <span className="block text-[11px] text-base-content/70">
                      {demo.email}
                    </span>
                  </span>
                  <span className="rounded bg-base-200 px-2 py-1 font-mono text-[10px] text-base-content/70">
                    {demo.password}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-base-content/70">
              {t("footer.demo")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
