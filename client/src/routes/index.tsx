import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  LockKeyhole,
  Star,
  Users,
} from "lucide-react";
import { api } from "../lib/api";
import type { ContentSummary, Product, Service } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";
import { SectionHeading } from "../components/ui";
import { ServiceCard } from "../components/ServiceCard";
import { ParticleHands } from "../components/ParticleHands";
export const Route = createFileRoute("/")({
  component: HomePage,
});

import { ProductCard } from "../components/ProductCard";

export default function HomePage() {
  const { t, pick, formatDate } = useI18n();
  const [heroTopic, setHeroTopic] = useState<number | null>(null);
  const heroTopics = [
    { label: t("home.topicNetworks"), text: t("home.topicNetworksText") },
    { label: t("home.topicSecurity"), text: t("home.topicSecurityText") },
    { label: t("home.topicWebsites"), text: t("home.topicWebsitesText") },
  ];

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
      <section className="home-hero">
        <div className="container-page home-hero-layout">
          <div className="home-hero-topline">
          <div className="home-hero-heading">
            <h1 className="home-hero-title">
              {t("home.heroTitle")}{" "}
              <span>{t("home.heroHighlight")}</span>
            </h1>
            <div className="home-hero-actions">
              <Link
                to="/quote"
                search={{ service: undefined }}
                className={cn(buttonVariants(), "h-control bg-primary px-6 text-sm text-primary-content hover:bg-primary-hover")}
              >
                {t("home.ctaQuote")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className={cn(buttonVariants(), "h-control border-hairline bg-surface px-6 text-sm text-ink hover:bg-base-200")}
              >
                {t("home.ctaServices")}
              </Link>
            </div>
          </div>
          </div>
          <ParticleHands />
        </div>

        <div className="container-page home-hero-topics-panel">
          <div
            className="home-hero-description"
            onMouseLeave={() => setHeroTopic(null)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setHeroTopic(null);
            }}
          >
            <ul className="home-hero-topics">
              {heroTopics.map((topic, index) => (
                <li key={topic.label}>
                  <button
                    type="button"
                    className="home-hero-topic"
                    aria-expanded={heroTopic === index}
                    aria-controls="hero-topic-description"
                    onMouseEnter={() => setHeroTopic(index)}
                    onFocus={() => setHeroTopic(index)}
                    onClick={() => setHeroTopic(index)}
                  >
                    {topic.label}
                  </button>
                </li>
              ))}
            </ul>
            <p
              id="hero-topic-description"
              className="home-hero-topic-description"
              data-active={heroTopic !== null}
              aria-hidden={heroTopic === null}
            >
              {heroTopic === null ? null : heroTopics[heroTopic].text}
            </p>
          </div>
        </div>

        <div className="container-page home-hero-stats">
          {[
            ["120+", "home.statProjects"],
            ["< 4 h", "home.statResponse"],
            ["40+", "home.statClients"],
            ["98 %", "home.statSatisfaction"],
          ].map(([value, key]) => (
            <div key={key}>
              <p className="text-2xl font-medium text-ink">{value}</p>
              <p className="mt-1 text-xs text-ink-muted">{t(key as TranslationKey)}</p>
            </div>
          ))}
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
            <Link
              to="/services"
              className={cn(
                buttonVariants(),
                " border-current bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm",
              )}
            >
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
                <p className="mt-1 text-xs leading-relaxed text-base-content/65">
                  {step.text}
                </p>
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
            <Link
              to="/products"
              className={cn(
                buttonVariants(),
                " border-current bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm",
              )}
            >
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
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-base-100 text-[10px] font-bold ${
                      [
                        "bg-primary text-primary-content",
                        "bg-success text-success-content",
                        "bg-warning text-warning-content",
                        "bg-neutral text-neutral-content",
                      ][index]
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
                <p className="text-xs text-base-content/65">
                  {t("home.trusted")}
                </p>
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
                <div
                  key={key}
                  className="rounded-box border border-base-300 bg-base-100 p-5"
                >
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
            <Link
              to="/blog"
              className={cn(
                buttonVariants(),
                " border-current bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm",
              )}
            >
              {t("blog.title")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                to="/blog/$slug"
                params={{ slug: article.slug }}
                className={cn(
                  "flex flex-col rounded-box card-hover border border-base-300 bg-base-100 p-5",
                )}
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
        <div className="overflow-hidden rounded-box bg-brand-indigo px-6 py-12 text-panel-foreground sm:px-12">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">
                {t("home.ctaTitle")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-panel-foreground/80 sm:text-base">
                {t("home.ctaText")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/quote"
                search={{ service: undefined }}
                className={cn(
                  buttonVariants(),
                  " bg-primary text-primary-content border-panel-foreground hover:bg-primary-hover h-control px-6 text-sm",
                )}
              >
                {t("home.ctaButton")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className={cn(
                  buttonVariants(),
                  " border-current bg-transparent text-base-content hover:bg-base-content/10 h-control px-6 text-sm border-panel-foreground/30 text-panel-foreground hover:bg-panel-foreground hover:text-brand-indigo",
                )}
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
