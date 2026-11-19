import { useToast } from "../context/ToastContext";
import { ActionButtonContent } from "./ActionButtonContent";
import { cn } from "@/lib/utils";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ShoppingCart,
  Package,
} from "lucide-react";
import type { Product } from "../lib/types";
import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nContext";

const categoryPhotos = new Map([
  ["network", "/catalog/network.webp"],
  ["surveillance", "/catalog/surveillance.webp"],
  ["computers", "/catalog/computers.webp"],
  ["servers", "/catalog/servers.webp"],
  ["communication", "/catalog/communication.webp"],
  ["accessories", "/catalog/accessories.webp"],
]);

const productPhotos = new Map([
  ["lenovo-thinkpad-e14", "/catalog/thinkpad-e14.webp"],
  ["dell-optiplex-7010", "/catalog/dell-desktop.webp"],
  ["fritzbox-7590-ax", "/catalog/wifi-router.webp"],
  ["unifi-6-pro", "/catalog/unifi-access-point.webp"],
  ["apc-ups-1500", "/catalog/battery-backup.webp"],
  ["hp-laserjet-pro", "/catalog/laser-printer.webp"],
]);

const responsivePhotos = new Map([
  ["/catalog/servers.webp", "/catalog/servers-400.webp 400w, /catalog/servers.webp 900w"],
  ["/catalog/wifi-router.webp", "/catalog/wifi-router-400.webp 400w, /catalog/wifi-router.webp 900w"],
]);

export function ProductVisual({
  product,
  className = "h-44",
  sizes = "(min-width: 1280px) 320px, (min-width: 640px) 50vw, 100vw",
}: {
  product: Product;
  className?: string;
  sizes?: string;
}) {
  const { t, pick } = useI18n();
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageUrl = product.imageUrl;
  const productPhoto = productPhotos.get(product.slug);
  const illustrativePhoto = productPhoto ?? categoryPhotos.get(product.category?.slug ?? "");

  if (imageUrl && imageUrl !== failedImage) {
    return (
      <img
        src={imageUrl}
        alt={pick(product.nameEn, product.nameDe)}
        className={`w-full rounded-t-box object-cover ${className}`}
        loading="lazy"
        onError={() => setFailedImage(imageUrl)}
      />
    );
  }
  if (illustrativePhoto) {
    const srcSet = responsivePhotos.get(illustrativePhoto);
    return (
      <div className={`relative w-full overflow-hidden rounded-t-box bg-base-200 ${className}`}>
        <img
          src={illustrativePhoto}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt=""
          className={cn("h-full w-full", productPhoto ? "object-contain" : "object-cover")}
          loading="lazy"
        />
        <span className="absolute bottom-2 right-2 rounded-box bg-base-100 px-2 py-1 text-xs text-base-content">
          {t("products.illustrativeImage")}
        </span>
      </div>
    );
  }
  return (
    <div
      className={`flex w-full items-center justify-center rounded-t-box bg-accent-sky ${className}`}
    >
      <Package className="size-14 text-ink" strokeWidth={1} aria-hidden="true" />
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { t, pick, formatMoney } = useI18n();
  const { notify } = useToast();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add(product);
    notify({ id: `cart-${product.id}`, status: "success", title: t("products.added"), description: pick(product.nameEn, product.nameDe) });
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
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-3 pt-2">
          <div className="shrink-0">
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
            <ActionButtonContent state={added ? "added" : "add"} label={added ? t("products.addedShort") : t("products.addToCart")}
              reserveLabel={t("products.addToCart")} textClassName="hidden sm:inline-grid"
              icon={added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />} />
          </Button>
        </div>
      </CardContent>
    </article>
  );
}
