import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";
import type { Product, ProductCategory } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { ProductCard } from "../components/ProductCard";
import { ProductCategoryNavigation } from "../components/ProductCategoryNavigation";
import { ScrollReveal } from "../components/beui/ScrollReveal";
import { EmptyState, ErrorState, PageLoader } from "../components/ui";

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => ({
    category: typeof search.category === "string" ? search.category.trim() || undefined : undefined,
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const { category = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  function setCategory(nextCategory: string) {
    void navigate({ search: previous => ({ ...previous, category: nextCategory || undefined }) });
  }

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => api<{ products: Product[] }>("/products"),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<{ categories: ProductCategory[] }>("/categories"),
  });

  function retryCatalog() {
    if (productsQuery.isError) void productsQuery.refetch();
    if (categoriesQuery.isError) void categoriesQuery.refetch();
  }

  const products = (productsQuery.data?.products ?? []).filter((product) => {
    const matchesCategory = !category || product.category?.slug === category;
    const haystack =
      `${product.nameEn} ${product.nameDe} ${product.sku} ${product.descriptionEn} ${product.descriptionDe}`.toLowerCase();
    return matchesCategory && haystack.includes(search.toLowerCase());
  });

  return (
    <div className="bg-base-100">
      <section className="hero-grid border-b border-base-300">
        <ScrollReveal className="container-page py-section">
          <h1 className="max-w-4xl text-4xl font-medium tracking-tight sm:text-5xl">
            {t("products.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-ink-soft">
            {t("products.text")}
          </p>
        </ScrollReveal>
      </section>

      <section className="container-page py-10">
        <ScrollReveal className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="block w-full min-w-0 max-w-md">
            <span className="mb-2 block text-sm font-medium">{t("products.searchLabel")}</span>
            <span className="flex h-10 min-w-0 items-center gap-2 rounded-field border border-input bg-base-100 px-3 text-base text-base-content focus-within:border-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
              <Search aria-hidden="true" className="h-4 w-4 shrink-0 opacity-50" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("products.searchPlaceholder")}
                className="min-w-0 grow bg-transparent text-base outline-none"
              />
            </span>
          </label>

          <ProductCategoryNavigation categories={categoriesQuery.data?.categories ?? []} value={category} onValueChange={setCategory} />
        </ScrollReveal>

        {productsQuery.isLoading && <PageLoader />}
        {(productsQuery.isError || categoriesQuery.isError) && (
          <ErrorState
            onRetry={retryCatalog}
            retrying={(productsQuery.isError && productsQuery.isFetching) ||
              (categoriesQuery.isError && categoriesQuery.isFetching)}
          />
        )}

        {!productsQuery.isLoading && !productsQuery.isError && (
          <>
            <p className="mt-5 text-xs text-base-content/65">
              {products.length} / {productsQuery.data?.products.length ?? 0}
            </p>
            <ScrollReveal className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollReveal>
            {products.length === 0 && (
              <div className="mt-6">
                <EmptyState
                  title={t("products.noProducts")}
                  text={t("products.searchPlaceholder")}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
