import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { api } from "../lib/api";
import type { Service } from "../lib/types";
import { getServiceGroupId, serviceGroups } from "../lib/serviceGroups";
import { useI18n } from "../i18n/I18nContext";
import { ServicePreviewCard } from "../components/ServicePreviewCard";
import { ScrollReveal } from "../components/beui/ScrollReveal";
import { EmptyState, ErrorState, PageLoader } from "../components/ui";

export const Route = createFileRoute("/services/")({
  component: ServicesPage,
});

export default function ServicesPage() {
  const { t } = useI18n();
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
        <ScrollReveal className="container-page py-14 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t("services.title")}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/65">
                {t("services.text")}
              </p>
            </div>
            <Link to="/quote" search={{ service: undefined }} className={cn(buttonVariants(), " bg-primary text-primary-content border-primary hover:bg-primary-hover")}>
              {t("nav.quote")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <section className="container-page py-10" aria-labelledby="service-topics-title">
        <ScrollReveal>
        <h2 id="service-topics-title" className="text-2xl font-medium tracking-tight sm:text-3xl">{t("services.chooseTopic")}</h2>
        <p className="mt-3 text-sm text-ink-soft">{t("services.browseHint")}</p>
        <nav aria-label={t("services.topicNavigation")} className="mt-6 grid gap-x-8 sm:grid-cols-3">
          {serviceGroups.map(group => (
            <a key={group.id} href={`#${group.id}`}
              className="flex min-h-14 items-center justify-between gap-3 border-b border-hairline py-4 text-sm font-medium text-ink hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <span>{t(group.titleKey)}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0" />
            </a>
          ))}
        </nav>

        <label className="mt-8 block max-w-md">
          <span className="mb-2 block text-sm font-medium">{t("services.searchLabel")}</span>
          <span className="flex h-control min-w-0 items-center gap-2 rounded-field border border-input bg-base-100 px-3 text-base text-ink focus-within:border-ring focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
            <Search aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("services.searchPlaceholder")}
              className="min-w-0 grow bg-transparent outline-none"
            />
          </span>
        </label>
        </ScrollReveal>

        {isLoading && <PageLoader />}
        {isError && <ErrorState onRetry={() => void refetch()} />}

        {!isLoading && !isError && (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p role="status" className="text-sm text-ink-soft">
                {t("services.resultsCount", { count: services.length, total: data?.services.length ?? 0 })}
              </p>
              {search && <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={() => setSearch("")}>{t("services.clearSearch")}</Button>}
            </div>
            {services.length === 0 && (
              <div className="mt-6">
                <EmptyState title={t("common.noResults")} text={t("services.noResultsText")} />
              </div>
            )}
            <div className="mt-10 space-y-12">
              {serviceGroups.map(group => {
                const entries = services.filter(service => getServiceGroupId(service.slug) === group.id);
                return (
                  <section key={group.id} aria-labelledby={group.id}>
                    <ScrollReveal>
                    <h2 id={group.id} tabIndex={-1} className="w-fit scroll-mt-24 rounded-sm text-2xl font-medium tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                      {t(group.titleKey)}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{t(group.descriptionKey)}</p>
                    {entries.length > 0 ? (
                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {entries.map(service => <ServicePreviewCard key={service.id} service={service} />)}
                      </div>
                    ) : <p className="mt-4 text-sm text-ink-muted">{t("services.noGroupResults")}</p>}
                    </ScrollReveal>
                  </section>
                );
              })}
            </div>
          </>
        )}

        <ScrollReveal className="mt-12 flex flex-col items-start justify-between gap-4 rounded-box border border-base-300 bg-base-200/60 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">{t("services.helpTitle")}</h2>
            <p className="mt-1 text-sm text-base-content/65">
              {t("services.helpText")}
            </p>
          </div>
          <Link to="/quote" search={{ service: undefined }} className={cn(buttonVariants(), " bg-primary text-primary-content border-primary hover:bg-primary-hover")}>
            {t("nav.quote")} <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
