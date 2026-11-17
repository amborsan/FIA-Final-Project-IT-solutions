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
import { ServiceIcon } from "../components/ServiceIcon";
import { ParticleHands } from "../components/ParticleHands";
import Grainient from "../components/Grainient";
import { TextReveal } from "../components/beui/TextReveal";
import { DecodedStat } from "../components/DecodedStat";
import { ProcessTimeline } from "../components/ProcessTimeline";
import { HomeSectionState } from "../components/HomeSectionState";
export const Route = createFileRoute("/")({
  component: HomePage,
});

import { ProductCard } from "../components/ProductCard";

export default function HomePage() {
  const { t, pick, formatDate, formatMoney } = useI18n();
  const [heroTopic, setHeroTopic] = useState<number | null>(null);
  const [topicReplays, setTopicReplays] = useState([0, 0, 0]);
  const [headingReplay, setHeadingReplay] = useState(0);
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

  const processPhases = [
    { title: t("home.processPhase1"), steps: processSteps.slice(0, 2) },
    { title: t("home.processPhase2"), steps: processSteps.slice(2, 5) },
    { title: t("home.processPhase3"), steps: processSteps.slice(5) },
  ];

  return (
    <>
      {/* Hero */}
      <section className="home-hero">
        <Grainient
          className="home-hero-gradient"
          aria-hidden="true"
          colors={["var(--hero-gradient-start)", "var(--hero-gradient-end)"]}
          angle={180}
          flow={2}
          silk={0.37}
          grainAmount={0.03}
          scale={0.6}
          speed={0.6}
          grainSize={0.6}
          contrast={1.23}
          saturation={1.19}
          variation={15}
          stir={0.75}
          grainAnimated={false}
        />
        <div className="container-page home-hero-layout">
          <div className="home-hero-topline">
          <div className="home-hero-heading">
            <h1
              className="home-hero-title"
              onPointerEnter={event => {
                if (event.pointerType === "mouse") setHeadingReplay(current => current + 1);
              }}
            >
              <TextReveal text={`${t("home.heroTitle")} ${t("home.heroHighlight")}`} replay={headingReplay} />
            </h1>
            <p className="mt-4 text-center text-base leading-normal text-ink-soft">
              {t("home.heroText")}
            </p>
            <div className="home-hero-actions">
              <Link
                to="/quote"
                search={{ service: undefined }}
                className={cn(buttonVariants(), "home-hero-cta-primary h-control bg-primary px-6 text-sm text-primary-content hover:bg-primary-hover")}
              >
                {t("home.ctaQuote")}
                <span className="home-hero-cta-icon" aria-hidden="true">
                  <ArrowRight className="home-hero-cta-arrow h-4 w-4" />
                  <span className="home-hero-topic-mark home-hero-cta-mark"><i /><i /><i /><i /></span>
                </span>
              </Link>
              <Link
                to="/services"
                className={cn(buttonVariants({ variant: "secondary" }), "home-hero-cta-secondary h-control border-hairline bg-surface px-6 text-sm text-ink-soft hover:text-ink hover:border-ink-soft")}
              >
                {t("home.ctaServices")}
                <span className="home-hero-cta-icon" aria-hidden="true"><ArrowRight className="home-hero-cta-arrow h-4 w-4" /></span>
              </Link>
            </div>
          </div>
          </div>
          <div className="home-hero-artwork">
            <ParticleHands />
          </div>
        </div>

        <div className="container-page home-hero-topics-panel">
          <div className="home-hero-description">
            <ul className="home-hero-topics">
              {heroTopics.map((topic, index) => (
                <li key={topic.label} className="home-hero-service" data-active={heroTopic === index}
                  onPointerEnter={event => { if (event.pointerType === "mouse") setHeroTopic(index); }}
                  onPointerLeave={() => setHeroTopic(null)}
                  onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHeroTopic(null); }}
                >
                      <button
                        id={`hero-topic-${index}`}
                        type="button"
                        className="home-hero-topic"
                        aria-expanded={heroTopic === index}
                        aria-controls={heroTopic === index ? `hero-topic-card-${index}` : undefined}
                        aria-describedby={heroTopic === index ? `hero-topic-text-${index}` : undefined}
                        onClick={() => setHeroTopic(current => current === index ? null : index)}
                        onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setHeroTopic(index); }}
                        onKeyDown={event => { if (event.key === "Escape") setHeroTopic(null); }}
                        onPointerEnter={event => {
                          if (event.pointerType !== "mouse") return;
                          setTopicReplays(current => current.map((count, topicIndex) => topicIndex === index ? count + 1 : count));
                        }}
                      >
                        <span className="home-hero-topic-mark" aria-hidden="true"><i /><i /><i /><i /></span>
                        <TextReveal text={topic.label} delay={index * 0.12} replay={topicReplays[index]} />
                      </button>
                    <div
                      id={`hero-topic-card-${index}`}
                      role="region"
                      aria-labelledby={`hero-topic-${index}`}
                      aria-hidden={heroTopic !== index}
                      data-slot={heroTopic === index ? "hero-service-detail" : undefined}
                      className="home-hero-service-detail"
                    >
                      <p id={`hero-topic-text-${index}`}>{topic.text}</p>
                    </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="container-page home-hero-stats">
          {[
            ["120+", "home.statProjects"],
            ["< 4 h", "home.statResponse"],
            ["40+", "home.statClients"],
            ["98 %", "home.statSatisfaction"],
          ].map(([value, key], index) => (
            <div key={key}>
              <dt className="home-hero-stat-label">{t(key as TranslationKey)}</dt>
              <dd className="home-hero-stat-value">
                <DecodedStat value={value} index={index} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
      {/* Services */}
      <section aria-label={t("home.servicesTitle")} className="section-space bg-base-200/60 pt-10 sm:pt-12">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
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
          <div className="mt-9">
            <HomeSectionState
              isPending={servicesQuery.isPending} isFetching={servicesQuery.isFetching}
              isError={servicesQuery.isError} hasItems={services.length > 0}
              loadingLabel={t("home.servicesLoading")} errorLabel={t("home.servicesError")}
              emptyTitle={t("home.servicesEmpty")} onRetry={() => { void servicesQuery.refetch(); }}
            >
              <ul role="list" className="grid gap-x-12 lg:grid-cols-2">
                {services.map(service => (
                  <li key={service.id} className="border-b border-hairline">
                    <Link
                      to="/services/$slug" params={{ slug: service.slug }}
                      aria-labelledby={`home-service-title-${service.id}`}
                      className="group flex h-full flex-col gap-3 rounded-md px-3 py-6 text-ink transition-colors hover:bg-accent-sky focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <div className="flex items-start gap-3">
                        <ServiceIcon name={service.icon} className="mt-0.5 size-5 shrink-0" />
                        <h3 id={`home-service-title-${service.id}`} className="min-w-0 text-lg font-medium leading-snug">
                          {pick(service.nameEn, service.nameDe)}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-ink-soft">
                        {pick(service.descriptionEn, service.descriptionDe)}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1 text-sm">
                        <span className="text-ink-soft">
                          {service.startingPrice ? `${t("services.startingAt")} ${formatMoney(service.startingPrice)}` : ""}
                        </span>
                        <span className="inline-flex items-center gap-2 font-medium group-hover:underline underline-offset-4">
                          {t("common.details")}<ArrowRight aria-hidden="true" className="size-4" />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </HomeSectionState>
          </div>
        </div>
      </section>

      {/* Process */}
      <section aria-label={t("home.processTitle")} className="section-space bg-base-100">
        <div className="container-page">
          <SectionHeading
            title={t("home.processTitle")}
            text={t("home.processText")}
          />
          <ProcessTimeline phases={processPhases} />
        </div>
      </section>

      {/* Featured products */}
      <section aria-label={t("home.productsTitle")} className="section-space bg-base-200/60">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
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
          <div className="mt-9">
            <HomeSectionState
              isPending={productsQuery.isPending} isFetching={productsQuery.isFetching}
              isError={productsQuery.isError} hasItems={products.length > 0}
              loadingLabel={t("home.productsLoading")} errorLabel={t("home.productsError")}
              emptyTitle={t("home.productsEmpty")} onRetry={() => { void productsQuery.refetch(); }}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </HomeSectionState>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section-space bg-base-100">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
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
                ].map(([icon, key]) => {
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
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Insights */}
          <section aria-label={t("home.blogTitle")} className="section-space bg-base-200/60">
            <div className="container-page">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading
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
              <div className="mt-9">
                <HomeSectionState
                  isPending={contentQuery.isPending} isFetching={contentQuery.isFetching}
                  isError={contentQuery.isError} hasItems={articles.length > 0}
                  loadingLabel={t("home.articlesLoading")} errorLabel={t("home.articlesError")}
                  emptyTitle={t("home.articlesEmpty")} onRetry={() => { void contentQuery.refetch(); }}
                >
                  <div className="grid gap-4 md:grid-cols-3">
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
            </HomeSectionState>
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
