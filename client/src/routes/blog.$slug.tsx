import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { api } from "../lib/api";
import type { ContentPage } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { RichText } from "../components/RichText";
import { ErrorState, PageLoader } from "../components/ui";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogDetailPage,
});

export default function BlogDetailPage() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const { t, pick, formatDate } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["content", slug],
    queryFn: () => api<{ page: ContentPage }>(`/content/${slug}`),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="container-page py-10">
        <ErrorState message={t("blog.notFound")} />
        <Link to="/blog" className="btn btn-outline btn-sm">
          <ArrowLeft className="h-4 w-4" /> {t("blog.back")}
        </Link>
      </div>
    );
  }

  const page = data.page;

  return (
    <div className="bg-base-100">
      <article className="container-page max-w-3xl py-10 sm:py-14">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-base-content/65 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> {t("blog.back")}
        </Link>
        <p className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(page.publishedAt || page.updatedAt)}
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {pick(page.titleEn, page.titleDe)}
        </h1>
        {page.author && (
          <p className="mt-3 text-sm text-base-content/65">
            {t("blog.by")} {page.author.fullName}
          </p>
        )}
        <div className="mt-7 border-t border-base-200 pt-7">
          <RichText html={pick(page.bodyEn, page.bodyDe)} />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-box bg-base-200 p-5">
          <p className="text-sm font-semibold">{t("blog.cta")}</p>
          <Link to="/contact" className="btn btn-primary btn-sm">
            {t("nav.contact")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
