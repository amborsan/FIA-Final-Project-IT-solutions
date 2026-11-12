import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Service } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quote")({
  validateSearch: (search: Record<string, unknown>) => ({
    service: typeof search.service === "string" ? search.service : undefined,
  }),
  component: QuotePage,
});

function QuotePage() {
  const { service: preselectedService } = Route.useSearch();
  const { user } = useAuth();
  const { t, pick } = useI18n();

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: () => api<{ services: Service[] }>("/services"),
  });

  const [form, setForm] = useState({
    contactName: user?.fullName ?? "",
    contactEmail: user?.email ?? "",
    contactPhone: user?.phone ?? "",
    title: "",
    description: "",
    serviceId: preselectedService ?? "",
    siteAddress: user?.address ?? "",
    preferredDate: "",
    budget: "",
    acceptPrivacy: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (preselectedService) {
      setForm((current) => ({ ...current, serviceId: preselectedService }));
    }
  }, [preselectedService]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ reference: string }>("/requests/public", {
        method: "POST",
        body: {
          ...form,
          serviceId: form.serviceId || undefined,
          preferredDate: form.preferredDate || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
        },
      });
      setReference(data.reference);
    } catch (caught) {
      setError(errorMessage(caught, t("quote.error")));
    } finally {
      setLoading(false);
    }
  }

  if (reference) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
        <div className="w-full max-w-lg rounded-box border border-base-300 bg-base-100 p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <h1 className="mt-4 text-2xl font-bold">{t("quote.successTitle")}</h1>
          <p className="mt-2 text-sm text-base-content/70">
            {t("quote.successText", { reference })}
          </p>
          <p className="mt-4 rounded-lg bg-base-200 px-3 py-2 font-mono text-sm">{reference}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/services" className={cn(buttonVariants(), " bg-primary text-primary-content border-primary hover:bg-primary-hover")}>
              {t("nav.services")}
            </Link>
            <Button className={cn(" border-transparent bg-transparent text-base-content hover:bg-base-content/10")} onClick={() => setReference("")}>
              {t("quote.newRequest")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100">
      <section className="hero-grid border-b border-base-300">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">{t("quote.eyebrow")}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t("quote.title")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/65">{t("quote.text")}</p>
        </div>
      </section>

      <section className="container-page grid gap-8 py-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <form onSubmit={submit} className="rounded-box border border-base-300 bg-base-100 p-6">
          <h2 className="text-lg font-bold">{t("quote.formTitle")}</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("quote.name")} <span className="text-error">*</span>
              </span>
              <Input
                required
                minLength={2}
                value={form.contactName}
                onChange={(event) => setForm({ ...form, contactName: event.target.value })}
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("quote.email")} <span className="text-error">*</span>
              </span>
              <Input
                required
                type="email"
                value={form.contactEmail}
                onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("quote.phone")} ({t("common.optional")})
              </span>
              <Input
                value={form.contactPhone}
                onChange={(event) => setForm({ ...form, contactPhone: event.target.value })}
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("quote.service")} ({t("common.optional")})
              </span>
              <NativeSelect
                value={form.serviceId}
                onChange={(event) => setForm({ ...form, serviceId: event.target.value })}
                className={cn(" w-full")}
              >
                <option value="">{t("quote.servicePlaceholder")}</option>
                {(servicesQuery.data?.services ?? []).map((service) => (
                  <option key={service.id} value={service.id}>
                    {pick(service.nameEn, service.nameDe)}
                  </option>
                ))}
              </NativeSelect>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold">
              {t("quote.titleLabel")} <span className="text-error">*</span>
            </span>
            <Input
              required
              minLength={3}
              maxLength={160}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder={pick("New office network", "Neues Büronetzwerk")}
              className={cn(" w-full")}
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold">
              {t("quote.description")} <span className="text-error">*</span>
            </span>
            <Textarea
              required
              minLength={20}
              maxLength={4000}
              rows={5}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder={t("quote.descriptionPlaceholder")}
              className={cn(" w-full")}
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("quote.address")} ({t("common.optional")})
              </span>
              <Input
                value={form.siteAddress}
                onChange={(event) => setForm({ ...form, siteAddress: event.target.value })}
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("quote.preferredDate")} ({t("common.optional")})
              </span>
              <Input
                type="date"
                value={form.preferredDate}
                onChange={(event) => setForm({ ...form, preferredDate: event.target.value })}
                className={cn(" w-full")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("quote.budget")}
              </span>
              <Input
                type="number"
                min={0}
                step={50}
                value={form.budget}
                onChange={(event) => setForm({ ...form, budget: event.target.value })}
                className={cn(" w-full")}
                placeholder="2500"
              />
            </label>
          </div>

          <label className="mt-5 flex items-start gap-2.5 rounded-lg bg-base-200 p-3 text-xs leading-relaxed text-base-content/65">
            <input
              type="checkbox"
              required
              checked={form.acceptPrivacy}
              onChange={(event) => setForm({ ...form, acceptPrivacy: event.target.checked })}
              className={cn("appearance-auto accent-primary size-6 shrink-0 rounded-field border border-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary size-5 mt-0.5")}
            />
            <span>
              {t("quote.consent")}{" "}
              <Link to="/legal/privacy" className={cn("underline cursor-pointer text-primary")}>
                {t("footer.privacy")}
              </Link>
            </span>
          </label>

          {error && <Alert className={cn("flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-error text-error-content border-error mt-4 py-2 text-sm")}>{error}</Alert>}

          <Button disabled={loading} className={cn(" bg-primary text-primary-content border-primary hover:bg-primary-hover mt-5 w-full sm:w-auto")}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("quote.submit")}
          </Button>

          {!user && (
            <p className="mt-3 text-xs text-base-content/70">
              {t("quote.loginHint")}{" "}
              <Link to="/login" className={cn("underline cursor-pointer text-primary")}>
                {t("nav.login")}
              </Link>
            </p>
          )}
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-box border border-base-300 bg-base-100 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-lg font-bold">{t("quote.sidebarTitle")}</h2>
            <p className="mt-1 text-sm text-base-content/65">{t("quote.sidebarText")}</p>
            <ol className="mt-4 space-y-3">
              {[1, 2, 3, 4].map((number) => (
                <li key={number} className="flex items-start gap-2.5 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {number}
                  </span>
                  <span className="text-base-content/65">
                    {t(`quote.point${number}` as "quote.point1")}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
              <Sparkles className="h-4 w-4" /> {t("quote.responseTime")}
            </div>
          </div>

          <div className="rounded-box bg-gradient-to-br from-primary to-secondary p-6 text-primary-content">
            <FileText className="h-6 w-6" />
            <h3 className="mt-3 text-base font-bold">{t("services.included")}</h3>
            <ul className="mt-3 space-y-2 text-xs text-primary-content/85">
              {[1, 2, 3, 4].map((number) => (
                <li key={number} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {t(`services.scope${number}` as "services.scope1")}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
