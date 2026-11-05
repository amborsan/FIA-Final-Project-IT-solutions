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
    const haystack = `${product.nameEn} ${product.nameDe} ${product.sku} ${product.descriptionEn} ${product.descriptionDe}`.toLowerCase();
    return matchesCategory && haystack.includes(search.toLowerCase());
  });

  return (
    <div className="bg-base-100">
      <section className="hero-grid border-b border-base-300">
        <div className="container-page py-14 sm:py-20">
          <p className="eyebrow">{t("products.eyebrow")}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t("products.title")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/65">
            {t("products.text")}
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="input input-bordered flex w-full max-w-md items-center gap-2">
            <Search className="h-4 w-4 opacity-50" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("products.searchPlaceholder")}
              className="grow"
            />
          </label>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-base-content/70" />
            <button
              onClick={() => setCategory("")}
              className={`btn btn-xs shrink-0 ${!category ? "btn-primary" : "btn-ghost"}`}
            >
              {t("common.all")}
            </button>
            {(categoriesQuery.data?.categories ?? []).map((entry) => (
              <button
                key={entry.id}
                onClick={() => setCategory(entry.slug)}
                className={`btn btn-xs shrink-0 ${category === entry.slug ? "btn-primary" : "btn-ghost"}`}
              >
                {pick(entry.nameEn, entry.nameDe)}
              </button>
            ))}
          </div>
        </div>

        {productsQuery.isLoading && <PageLoader />}
        {productsQuery.isError && <ErrorState onRetry={() => void productsQuery.refetch()} />}

        {!productsQuery.isLoading && !productsQuery.isError && (
          <>
            <p className="mt-5 text-xs text-base-content/65">
              {products.length} / {productsQuery.data?.products.length ?? 0}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {products.length === 0 && (
              <div className="mt-6">
                <EmptyState title={t("products.noProducts")} text={t("products.searchPlaceholder")} />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
