import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { api } from "../lib/api";
import type { Product } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useCart } from "../context/CartContext";
import { ProductCard, ProductVisual } from "../components/ProductCard";
import { ErrorState, PageLoader } from "../components/ui";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetailPage,
});

export default function ProductDetailPage() {
  const { slug } = useParams({ from: "/products/$slug" });
  const { t, pick, formatMoney } = useI18n();
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => api<{ product: Product }>(`/products/${slug}`),
  });

  const relatedQuery = useQuery({
    queryKey: ["products", "related", productQuery.data?.product.category?.slug],
    queryFn: () => api<{ products: Product[] }>("/products"),
    enabled: !!productQuery.data,
  });

  if (productQuery.isLoading) return <PageLoader />;
  if (productQuery.isError || !productQuery.data) {
    return (
      <div className="container-page py-10">
        <ErrorState message={t("products.notFound")} />
        <Link to="/products" className="btn btn-outline btn-sm">
          <ArrowLeft className="h-4 w-4" /> {t("nav.products")}
        </Link>
      </div>
    );
  }

  const product = productQuery.data.product;
  const related = (relatedQuery.data?.products ?? [])
    .filter(
      (entry) => entry.id !== product.id && entry.category?.id === product.category?.id,
    )
    .slice(0, 4);

  function handleAdd() {
    add(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="bg-base-100">
      <div className="container-page py-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-base-content/65 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> {t("nav.products")}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-box border border-base-300 bg-base-100">
            <ProductVisual product={product} className="h-80 sm:h-[26rem]" />
            <div className="grid grid-cols-3 gap-2 border-t border-base-200 p-3 text-center text-[11px] text-base-content/65">
              <div className="rounded-lg bg-base-200/70 p-2">
                <Truck className="mx-auto mb-1 h-4 w-4 text-primary" />
                {t("products.delivery")}
              </div>
              <div className="rounded-lg bg-base-200/70 p-2">
                <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-primary" />
                {t("products.warranty")}
              </div>
              <div className="rounded-lg bg-base-200/70 p-2">
                <PackageCheck className="mx-auto mb-1 h-4 w-4 text-primary" />
                {product.sku}
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-ghost badge-sm">
                {product.category ? pick(product.category.nameEn, product.category.nameDe) : ""}
              </span>
              {product.featured && (
                <span className="badge badge-accent badge-sm">{t("products.featured")}</span>
              )}
              <span className={`badge badge-sm ${product.stock > 0 ? "badge-success" : "badge-error"}`}>
                {product.stock > 0 ? t("products.inStock") : t("products.outOfStock")}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {pick(product.nameEn, product.nameDe)}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-base-content/65">
              {pick(product.descriptionEn, product.descriptionDe)}
            </p>

            <div className="mt-6 rounded-box border border-base-300 bg-base-200/50 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-black text-primary">{formatMoney(product.price)}</p>
                  <p className="text-xs text-base-content/65">
                    {pick("incl. 19% VAT", "inkl. 19 % MwSt.")}
                  </p>
                </div>
                <p className="text-xs text-base-content/65">
                  {t("products.stockCount", { count: product.stock })}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="join">
                  <button
                    className="btn btn-sm join-item"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="btn btn-sm join-item pointer-events-none w-12">
                    {quantity}
                  </span>
                  <button
                    className="btn btn-sm join-item"
                    onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className={`btn flex-1 ${added ? "btn-success" : "btn-primary"}`}
                >
                  {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  {added ? t("products.added") : t("products.addToCart")}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-box border border-base-300 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Truck className="h-4 w-4 text-primary" /> {t("products.delivery")}
                </p>
                <p className="mt-1 text-xs text-base-content/65">{t("products.deliveryText")}</p>
              </div>
              <div className="rounded-box border border-base-300 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" /> {t("products.warranty")}
                </p>
                <p className="mt-1 text-xs text-base-content/65">{t("products.warrantyText")}</p>
              </div>
            </div>

            <div className="mt-5 rounded-box bg-secondary/5 p-4">
              <p className="text-sm font-semibold">{t("products.advice")}</p>
              <p className="mt-1 text-xs text-base-content/70">{t("products.adviceText")}</p>
              <div className="mt-3 flex gap-2">
                <Link to="/contact" className="btn btn-outline btn-xs">
                  {t("nav.contact")}
                </Link>
                <Link to="/quote" search={{ service: undefined }} className="btn btn-ghost btn-xs">
                  {t("nav.quote")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">{t("products.related")}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((entry) => (
                <ProductCard key={entry.id} product={entry} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
