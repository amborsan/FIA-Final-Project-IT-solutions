import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ShoppingCart } from "lucide-react";
import type { Product } from "../lib/types";
import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nContext";

const categoryIcon: Record<string, string> = {
  network: "📶",
  surveillance: "📷",
  computers: "💻",
  servers: "🗄️",
  communication: "☎️",
  accessories: "🔌",
};

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
  return (
    <div
      className={`flex w-full items-center justify-center rounded-t-box bg-gradient-to-br from-base-200 via-base-100 to-primary/5 ${className}`}
    >
      <span className="text-5xl opacity-80" aria-hidden="true">
        {categoryIcon[product.category?.slug ?? ""] ?? "📦"}
      </span>
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
    <article className="card card-hover overflow-hidden border border-base-300 bg-base-100">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block"
        aria-label={pick(product.nameEn, product.nameDe)}
      >
        <ProductVisual product={product} />
      </Link>
      <div className="card-body gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/70">
            {product.category ? pick(product.category.nameEn, product.category.nameDe) : product.sku}
          </span>
          {product.featured && (
            <span className="badge badge-accent badge-xs">{t("products.featured")}</span>
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
            className={`btn btn-sm ${added ? "btn-success" : "btn-primary"}`}
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
