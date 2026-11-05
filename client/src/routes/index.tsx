import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { api } from "../lib/api";
import type { ContentSummary, Product, Service } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";
import { SectionHeading } from "../components/ui";
import { ServiceCard } from "../components/ServiceCard";
export const Route = createFileRoute("/")({
  component: HomePage,
});

import { ProductCard } from "../components/ProductCard";

export default function HomePage() {
  const { t, pick, formatDate } = useI18n();

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: () => api<{ services: Service[] }>("/services"),
  });

  const productsQuery = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => api<{ products: Product[] }>("/products?featured=true"),
  });

  const contentQuery = useQuery({
    queryKey: ["content", "home"],
    queryFn: () => api<{ pages: ContentSummary[] }>("/content"),
  });

  const services = servicesQuery.data?.services ?? [];
  const products = (productsQuery.data?.products ?? []).slice(0, 4);
  const articles = (contentQuery.data?.pages ?? []).slice(0, 3);

  const processSteps = Array.from({ length: 8 }, (_, index) => ({
    number: index + 1,
    title: t(`home.step${index + 1}.title` as TranslationKey),
    text: t(`home.step${index + 1}.text` as TranslationKey),
  }));

  return (
    <>
      {/* Hero */}
      <section className="hero-grid overflow-hidden border-b border-base-300 bg-base-100">
        <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="fade-up">
            <p className="eyebrow rounded-full bg-primary/8 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {t("home.badge")}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("home.heroHighlight")}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-base-content/65 sm:text-lg">
              {t("home.heroText")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/quote" search={{ service: undefined }} className="btn btn-primary btn-lg">
                {t("home.ctaQuote")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/services" className="btn btn-outline btn-lg">
                {t("home.ctaServices")}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-base-content/65">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-success" />{" "}
                {pick("GDPR-aware", "DSGVO-bewusst")}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />{" "}
                {pick("Berlin & remote Germany", "Berlin & remote in Deutschland")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />{" "}
                {pick("Reply within 1 business day", "Antwort innerhalb eines Werktags")}
              </span>
            </div>
          </div>

          {/* Small product mock-up built with plain HTML/CSS */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-primary/10 to-secondary/10 blur-2xl" />
            <div className="relative rounded-box border border-base-300 bg-base-100 p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/70">
                    {pick("Project overview", "Projektübersicht")}
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {pick("Office network upgrade", "Büronetzwerk-Upgrade")}
                  </p>
                </div>
                <span className="badge badge-success badge-sm">
                  {pick("On track", "Im Plan")}
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  [pick("Site assessment", "Standortprüfung"), true],
                  [pick("Quote approved", "Angebot bestätigt"), true],
                  [pick("Cabling & hardware", "Verkabelung & Hardware"), true],
                  [pick("Configuration", "Konfiguration"), false],
                  [pick("Handover & report", "Übergabe & Bericht"), false],
                ].map(([label, done], index) => (
                  <div key={String(label)} className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        done ? "bg-success text-success-content" : "bg-base-200 text-base-content/65"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className={`text-xs ${done ? "text-base-content/70 line-through" : "font-medium"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-base-200 pt-4 text-center">
                <div>
                  <p className="text-lg font-bold text-primary">12</p>
                  <p className="text-[10px] uppercase tracking-wide text-base-content/70">
                    {pick("Desks", "Tische")}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">3</p>
                  <p className="text-[10px] uppercase tracking-wide text-base-content/70">
                    {pick("APs", "APs")}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">1</p>
                  <p className="text-[10px] uppercase tracking-wide text-base-content/70">
                    {pick("Day", "Tag")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-base-200 bg-base-100/80">
          <div className="container-page grid grid-cols-2 gap-4 py-6 sm:grid-cols-4">
            {[
              ["120+", "home.statProjects"],
              ["< 4 h", "home.statResponse"],
              ["40+", "home.statClients"],
              ["98 %", "home.statSatisfaction"],
            ].map(([value, key]) => (
              <div key={key} className="text-center sm:text-left">
                <p className="text-2xl font-black text-primary">{value}</p>
                <p className="text-xs text-base-content/65">{t(key as TranslationKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-space bg-base-200/60">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={t("home.servicesEyebrow")}
              title={t("home.servicesTitle")}
              text={t("home.servicesText")}
            />
            <Link to="/services" className="btn btn-outline btn-sm">
              {t("services.title")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-space bg-base-100">
        <div className="container-page">
          <SectionHeading
            eyebrow={t("home.processEyebrow")}
            title={t("home.processTitle")}
            text={t("home.processText")}
            align="center"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-box border border-base-300 bg-base-100 p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
                  {step.number}
                </span>
                <h3 className="mt-3 text-sm font-bold">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-base-content/65">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section-space bg-base-200/60">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={t("home.productsEyebrow")}
              title={t("home.productsTitle")}
              text={t("home.productsText")}
            />
            <Link to="/products" className="btn btn-outline btn-sm">
              {t("products.title")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section-space bg-base-100">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow={t("home.whyEyebrow")}
              title={t("home.whyTitle")}
              text={t("home.whyText")}
            />
            <div className="mt-6 flex items-center gap-3 rounded-box border border-base-300 bg-base-200/60 p-4">
              <div className="flex -space-x-2">
                {["AD", "JW", "MK", "SR"].map((initials, index) => (
                  <span
                    key={initials}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-base-100 text-[10px] font-bold text-white ${
                      ["bg-primary", "bg-teal-700", "bg-amber-700", "bg-neutral"][index]
                    }`}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-base-content/65">{t("home.trusted")}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Users", "home.why1"],
              ["LockKeyhole", "home.why2"],
              ["BadgeCheck", "home.why3"],
              ["HeartHandshake", "home.why4"],
            ].map(([icon, key], index) => {
              const icons = { Users, LockKeyhole, BadgeCheck, HeartHandshake };
              const Icon = icons[icon as keyof typeof icons] ?? Users;
              return (
                <div key={key} className="rounded-box border border-base-300 bg-base-100 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-sm font-bold">
                    {t(`${key}.title` as TranslationKey)}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-base-content/65">
                    {t(`${key}.text` as TranslationKey)}
                  </p>
                  <span className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-base-content/65">
                    0{index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="section-space bg-base-200/60">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={t("home.blogEyebrow")}
              title={t("home.blogTitle")}
              text={t("home.blogText")}
            />
            <Link to="/blog" className="btn btn-outline btn-sm">
              {t("blog.title")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                to="/blog/$slug"
                params={{ slug: article.slug }}
                className="card card-hover border border-base-300 bg-base-100 p-5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                  {formatDate(article.publishedAt || article.updatedAt)}
                </p>
                <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug">
                  {pick(article.titleEn, article.titleDe)}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-base-content/65">
                  {pick(article.excerptEn, article.excerptDe)}
                </p>
                <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  {t("home.readMore")} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-16">
        <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-primary via-primary to-[oklch(38%_0.09_230)] px-6 py-12 text-primary-content sm:px-12">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">{t("home.ctaTitle")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-primary-content/75 sm:text-base">
                {t("home.ctaText")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/quote" search={{ service: undefined }} className="btn btn-accent btn-lg">
                {t("home.ctaButton")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="btn btn-outline btn-lg border-primary-content/30 text-primary-content hover:bg-primary-content hover:text-primary"
              >
                {t("nav.contact")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
