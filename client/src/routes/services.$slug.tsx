import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
} from "lucide-react";
import { api } from "../lib/api";
import type { Service } from "../lib/types";
import { getServiceExampleKey, getServiceScopeKeys } from "../lib/serviceScope";
import { getServiceGroupId } from "../lib/serviceGroups";
import { siteContact } from "../lib/siteContact";
import { useI18n } from "../i18n/I18nContext";
import { ServiceIcon } from "../components/ServiceIcon";
import { ServicePreviewCard } from "../components/ServicePreviewCard";
import { ErrorState, PageLoader } from "../components/ui";

export const Route = createFileRoute("/services/$slug")({
  component: ServiceDetailPage,
});

const examplePhotos = {
  "connected-teams": { src: "/catalog/service.webp", altKey: "services.technicianPhoto" },
  "secure-systems": { src: "/site-photos/camera-installation.webp", altKey: "services.securityPhoto" },
  "business-online": { src: "/site-photos/site-development.webp", altKey: "services.webPhoto" },
} as const;

function ServiceDetailPage() {
  const { slug } = useParams({ from: "/services/$slug" });
  const { t, pick, formatMoney } = useI18n();

  const serviceQuery = useQuery({
    queryKey: ["service", slug],
    queryFn: () => api<{ service: Service }>(`/services/${slug}`),
  });

  const allQuery = useQuery({
    queryKey: ["services"],
    queryFn: () => api<{ services: Service[] }>("/services"),
  });

  if (serviceQuery.isLoading) return <PageLoader />;
  if (serviceQuery.isError || !serviceQuery.data) {
    return (
      <div className="container-page py-10">
        <ErrorState message={t("services.notFound")} />
        <Link to="/services" className={cn(buttonVariants(), " border-current bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm")}>
          <ArrowLeft className="h-4 w-4" /> {t("services.eyebrow")}
        </Link>
      </div>
    );
  }

  const service = serviceQuery.data.service;
  const exampleKey = getServiceExampleKey(service.slug);
  const photo = examplePhotos[getServiceGroupId(service.slug)];
  const related = (allQuery.data?.services ?? [])
    .filter((entry) => entry.id !== service.id)
    .slice(0, 3);

  return (
    <div className="bg-base-100">
      <section className="hero-grid border-b border-base-300">
        <div className="container-page py-12 sm:py-16">
          <Link
            to="/services"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-base-content/65 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> {t("nav.services")}
          </Link>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="min-w-0">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">
                <ServiceIcon name={service.icon} className="h-7 w-7" />
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-tight [overflow-wrap:anywhere] sm:text-5xl">
                {pick(service.nameEn, service.nameDe)}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/65 sm:text-lg">
                {pick(service.descriptionEn, service.descriptionDe)}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {service.startingPrice && (
                  <span className="rounded-lg bg-base-200 px-4 py-2 text-sm">
                    <span className="text-base-content/65">
                      {t("services.startingAt")}
                    </span>{" "}
                    <strong>{formatMoney(service.startingPrice)}</strong>
                  </span>
                )}
                <Link
                  to="/quote"
                  search={{ service: service.id }}
                  className={cn(buttonVariants(), " bg-primary text-primary-content border-primary hover:bg-primary-hover")}
                >
                  {t("services.requestQuote")}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-box border border-base-300 bg-base-100 p-6 shadow-lg">
              <h2 className="text-base font-bold">{t("services.included")}</h2>
              <ul className="mt-4 space-y-3">
                {getServiceScopeKeys(service.slug).map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2 border-t border-base-200 pt-4 text-xs text-base-content/70">
                <a href={siteContact.phoneHref} className="flex items-center gap-2 hover:text-primary">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {siteContact.phone}
                </a>
                <a href={siteContact.emailHref} className="flex items-center gap-2 hover:text-primary">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {siteContact.email}
                </a>
                <p className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> {t("quote.responseTime")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {exampleKey && (
        <section className="container-page py-12" aria-labelledby="service-example-title">
          <div className="grid items-center gap-6 rounded-box border border-hairline bg-surface p-5 sm:p-8 lg:grid-cols-2">
            <div>
              <h2 id="service-example-title" className="text-2xl font-bold">{t("services.exampleTitle")}</h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">{t(exampleKey)}</p>
            </div>
            <img
              src={photo.src}
              alt={t(photo.altKey)}
              className="aspect-video w-full rounded-box object-cover"
              loading="lazy"
            />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="container-page py-12" aria-labelledby="related-services-title">
          <h2 id="related-services-title" className="text-2xl font-bold">{t("services.related")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <ServicePreviewCard key={entry.id} service={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
