import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ShoppingCart, Network, Camera, Monitor, Server, Phone, Cable, Package } from "lucide-react";
import type { Product } from "../lib/types";
import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nContext";

const categoryIcon = { network: Network, surveillance: Camera, computers: Monitor, servers: Server, communication: Phone, accessories: Cable };

export function ProductVisual({
  product,
  className = "h-44",
}: {
  product: Product;
  className?: string;
}) {
  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.nameEn}
        className={`w-full rounded-t-box object-cover ${className}`}
        loading="lazy"
      />
    );
  }
  const Icon = categoryIcon[product.category?.slug as keyof typeof categoryIcon] ?? Package;
  return (
    <div
      className={`flex w-full items-center justify-center rounded-t-box bg-base-200 ${className}`}
    >
      <Icon className="h-14 w-14 text-primary" strokeWidth={1.5} aria-hidden="true" />
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { t, pick, formatMoney } = useI18n();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="ds-card ds-card-hover overflow-hidden border border-base-300 bg-base-100">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block"
        aria-label={pick(product.nameEn, product.nameDe)}
      >
        <ProductVisual product={product} />
      </Link>
      <div className="ds-card-body gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/70">
            {product.category ? pick(product.category.nameEn, product.category.nameDe) : product.sku}
          </span>
          {product.featured && (
            <span className="ds-badge ds-badge-accent ds-badge-xs">{t("products.featured")}</span>
          )}
        </div>
        <Link to="/products/$slug" params={{ slug: product.slug }}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug hover:text-primary">
            {pick(product.nameEn, product.nameDe)}
          </h3>
        </Link>
        <p className="line-clamp-2 text-xs leading-relaxed text-base-content/65">
          {pick(product.descriptionEn, product.descriptionDe)}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-base font-bold">{formatMoney(product.price)}</p>
            <p className={`text-[11px] ${product.stock > 0 ? "text-emerald-700" : "text-red-700"}`}>
              {product.stock > 0
                ? t("products.stockCount", { count: product.stock })
                : t("products.outOfStock")}
            </p>
          </div>
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={handleAdd}
            className={`ds-btn ds-btn-sm ${added ? "ds-btn-success" : "ds-btn-primary"}`}
            aria-label={t("products.addToCart")}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {added ? t("products.added") : t("products.addToCart")}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
