import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { api } from "../lib/api";
import type { Service } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { ServiceCard } from "../components/ServiceCard";
import { EmptyState, ErrorState, PageLoader } from "../components/ui";

export const Route = createFileRoute("/services/")({
  component: ServicesPage,
});

export default function ServicesPage() {
  const { t, pick } = useI18n();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["services"],
    queryFn: () => api<{ services: Service[] }>("/services"),
  });

  const services = (data?.services ?? []).filter((service) => {
    const haystack = `${service.nameEn} ${service.nameDe} ${service.descriptionEn} ${service.descriptionDe}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div className="bg-base-100">
      <section className="hero-grid border-b border-base-300">
        <div className="container-page py-14 sm:py-20">
          <p className="eyebrow">{t("services.eyebrow")}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t("services.title")}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/65">
                {t("services.text")}
              </p>
            </div>
            <Link to="/quote" search={{ service: undefined }} className="ds-btn ds-btn-primary">
              {t("nav.quote")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <label className="ds-input ds-input-bordered flex max-w-md items-center gap-2">
          <Search className="h-4 w-4 opacity-50" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("services.searchPlaceholder")}
            className="grow"
          />
        </label>

        {isLoading && <PageLoader />}
        {isError && <ErrorState onRetry={() => void refetch()} />}

        {!isLoading && !isError && (
          <>
            <p className="mt-5 text-xs text-base-content/65">
              {services.length} / {data?.services.length ?? 0}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            {services.length === 0 && (
              <div className="mt-6">
                <EmptyState title={t("common.noResults")} text={t("services.searchPlaceholder")} />
              </div>
            )}
          </>
        )}

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-box border border-base-300 bg-base-200/60 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">{t("services.cta")}</h2>
            <p className="mt-1 text-sm text-base-content/65">
              {pick(
                "Tell us the current problem and the outcome you want. We will suggest a sensible scope.",
                "Beschreiben Sie das aktuelle Problem und Ihr Ziel. Wir schlagen einen sinnvollen Umfang vor.",
              )}
            </p>
          </div>
          <Link to="/quote" search={{ service: undefined }} className="ds-btn ds-btn-primary">
            {t("nav.quote")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
