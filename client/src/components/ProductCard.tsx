import { cn } from "@/lib/utils";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ShoppingCart,
  Router,
  Cctv,
  Laptop,
  Server,
  Phone,
  Cable,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { Product } from "../lib/types";
import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nContext";

const categoryIcon: Record<string, LucideIcon> = {
  network: Router,
  surveillance: Cctv,
  computers: Laptop,
  servers: Server,
  communication: Phone,
  accessories: Cable,
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
  const Icon = categoryIcon[product.category?.slug ?? ""] ?? Package;
  return (
    <div
      className={`flex w-full items-center justify-center rounded-t-box bg-accent-sky ${className}`}
    >
      <Icon className="size-14 text-ink" strokeWidth={1} aria-hidden="true" />
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
    <article
      className={cn(
        "flex flex-col rounded-box card-hover overflow-hidden border border-base-300 bg-base-100",
      )}
    >
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block"
        aria-label={pick(product.nameEn, product.nameDe)}
      >
        <ProductVisual product={product} />
      </Link>
      <CardContent className={cn("flex flex-auto flex-col gap-3 p-6")}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/70">
            {product.category
              ? pick(product.category.nameEn, product.category.nameDe)
              : product.sku}
          </span>
          {product.featured && (
            <Badge
              className={cn(
                " bg-accent text-accent-content border-accent h-4 text-xs",
              )}
            >
              {t("products.featured")}
            </Badge>
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
            <p
              className={`text-[11px] ${product.stock > 0 ? "text-success" : "text-error"}`}
            >
              {product.stock > 0
                ? t("products.stockCount", { count: product.stock })
                : t("products.outOfStock")}
            </p>
          </div>
          <Button
            type="button"
            disabled={product.stock <= 0}
            onClick={handleAdd}
            className={cn(
              ` h-8 px-3 text-sm ${added ? "bg-success text-success-content border-success hover:bg-success/90" : "bg-primary text-primary-content border-primary hover:bg-primary-hover"}`,
            )}
            aria-label={t("products.addToCart")}
          >
            {added ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {added ? t("products.added") : t("products.addToCart")}
            </span>
          </Button>
        </div>
      </CardContent>
    </article>
  );
}
