import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { api } from "../lib/api";
import type { ContentSummary } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { EmptyState, ErrorState, PageLoader } from "../components/ui";

export const Route = createFileRoute("/blog/")({
  component: BlogPage,
});

export default function BlogPage() {
  const { t, pick, formatDate } = useI18n();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["content"],
    queryFn: () => api<{ pages: ContentSummary[] }>("/content"),
  });

  const pages = data?.pages ?? [];

  return (
    <div className="bg-base-100">
      <section className="hero-grid border-b border-base-300">
        <div className="container-page py-14 sm:py-20">
          <p className="eyebrow">{t("blog.eyebrow")}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t("blog.title")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/65">{t("blog.text")}</p>
        </div>
      </section>

      <section className="container-page py-10">
        {isLoading && <PageLoader />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {!isLoading && !isError && pages.length === 0 && (
          <EmptyState title={t("blog.noPosts")} />
        )}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.id}
              to="/blog/$slug"
              params={{ slug: page.slug }}
              className={cn("flex flex-col rounded-box card-hover border border-base-300 bg-base-100 p-6")}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-base-content/70">
                {formatDate(page.publishedAt || page.updatedAt)}
              </p>
              <h2 className="mt-1.5 text-lg font-bold leading-snug">{pick(page.titleEn, page.titleDe)}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-base-content/65">
                {pick(page.excerptEn, page.excerptDe)}
              </p>
              <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                {t("blog.readMore")} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
