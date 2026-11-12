import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";
import type { Product, ProductCategory } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { ProductCard } from "../components/ProductCard";
import { EmptyState, ErrorState, PageLoader } from "../components/ui";

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
});

export default function ProductsPage() {
  const { t, pick } = useI18n();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => api<{ products: Product[] }>("/products"),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<{ categories: ProductCategory[] }>("/categories"),
  });

  const products = (productsQuery.data?.products ?? []).filter((product) => {
    const matchesCategory = !category || product.category?.slug === category;
    const haystack =
      `${product.nameEn} ${product.nameDe} ${product.sku} ${product.descriptionEn} ${product.descriptionDe}`.toLowerCase();
    return matchesCategory && haystack.includes(search.toLowerCase());
  });

  return (
    <div className="bg-base-100">
      <section className="hero-grid border-b border-base-300">
        <div className="container-page py-section">
          <p className="eyebrow">{t("products.eyebrow")}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-tight sm:text-5xl">
            {t("products.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-ink-soft">
            {t("products.text")}
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label
            className={cn(
              "h-10 min-w-0 rounded-field border border-input bg-base-100 px-3 text-sm text-base-content outline-none focus-within:border-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary disabled:opacity-50 flex w-full max-w-md items-center gap-2",
            )}
          >
            <Search className="h-4 w-4 opacity-50" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("products.searchPlaceholder")}
              className="min-w-0 grow bg-transparent outline-none"
            />
          </label>

          <div className="flex items-center gap-inline overflow-x-auto pb-1">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-base-content/70" />
            <Button
              onClick={() => setCategory("")}
              className={cn(
                ` h-10 rounded-pill px-4 text-sm shrink-0 ${!category ? "bg-primary text-primary-content border-primary hover:bg-primary-hover" : "border-transparent bg-transparent text-base-content hover:bg-base-content/10"}`,
              )}
            >
              {t("common.all")}
            </Button>
            {(categoriesQuery.data?.categories ?? []).map((entry) => (
              <Button
                key={entry.id}
                onClick={() => setCategory(entry.slug)}
                className={cn(
                  ` h-10 rounded-pill px-4 text-sm shrink-0 ${category === entry.slug ? "bg-primary text-primary-content border-primary hover:bg-primary-hover" : "border-transparent bg-transparent text-base-content hover:bg-base-content/10"}`,
                )}
              >
                {pick(entry.nameEn, entry.nameDe)}
              </Button>
            ))}
          </div>
        </div>

        {productsQuery.isLoading && <PageLoader />}
        {productsQuery.isError && (
          <ErrorState onRetry={() => void productsQuery.refetch()} />
        )}

        {!productsQuery.isLoading && !productsQuery.isError && (
          <>
            <p className="mt-5 text-xs text-base-content/65">
              {products.length} / {productsQuery.data?.products.length ?? 0}
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
