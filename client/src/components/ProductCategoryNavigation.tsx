import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import type { ProductCategory } from "../lib/types";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

type Props = {
  categories: ProductCategory[];
  value: string;
  onValueChange: (value: string) => void;
};

export function ProductCategoryNavigation({ categories, value, onValueChange }: Props) {
  const { t, pick, language } = useI18n();
  const id = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ overflow: false, previous: false, next: false });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const maximum = viewport.scrollWidth - viewport.clientWidth;
      const next = {
        overflow: maximum > 1,
        previous: viewport.scrollLeft > 1,
        next: viewport.scrollLeft < maximum - 1,
      };
      setScroll(current => current.overflow === next.overflow && current.previous === next.previous && current.next === next.next ? current : next);
    };
    const revealSelection = () => {
      // Reveal the selection horizontally without moving the whole page.
      const selected = viewport.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (selected) {
        const box = selected.getBoundingClientRect();
        const bounds = viewport.getBoundingClientRect();
        if (box.left < bounds.left + 4) viewport.scrollLeft += box.left - bounds.left - 4;
        else if (box.right > bounds.right - 4) viewport.scrollLeft += box.right - bounds.right + 4;
      }
    };
    const frame = requestAnimationFrame(() => { revealSelection(); measure(); });
    const resize = new ResizeObserver(() => { revealSelection(); measure(); });
    resize.observe(viewport);
    if (viewport.firstElementChild) resize.observe(viewport.firstElementChild);
    viewport.addEventListener("scroll", measure, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      viewport.removeEventListener("scroll", measure);
    };
  }, [categories, language, value]);

  function move(direction: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({
      left: direction * viewport.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  const categoryButtonClass = (selected: boolean) => cn(
    "min-h-11 shrink-0 px-4 text-sm",
    selected ? "border-primary bg-primary font-nav text-primary-content hover:bg-primary-hover" : "border-hairline bg-transparent text-ink-soft hover:border-ink-muted hover:bg-canvas",
  );

  return (
    <div className="w-full min-w-0 lg:max-w-2xl lg:flex-1">
      <div className="mb-2 flex min-h-11 items-center justify-between gap-3">
        <div className="min-w-0">
          <span id={`${id}-label`} className="flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal aria-hidden="true" className="size-4 shrink-0" />{t("products.categories")}
          </span>
          {scroll.overflow && <p id={`${id}-hint`} className="mt-0.5 text-xs text-ink-muted">{t("products.categoryScrollHint")}</p>}
        </div>
        {scroll.overflow && (
          <div className="flex shrink-0 gap-1">
            <Button type="button" variant="outline" size="icon" className="size-11" aria-label={t("products.previousCategories")} aria-controls={id} disabled={!scroll.previous} onClick={() => move(-1)}>
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" className="size-11" aria-label={t("products.nextCategories")} aria-controls={id} disabled={!scroll.next} onClick={() => move(1)}>
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        )}
      </div>
      <div ref={viewportRef} id={id} role="group" aria-labelledby={`${id}-label`} aria-describedby={scroll.overflow ? `${id}-hint` : undefined}
        className="overflow-x-auto overscroll-x-contain px-1 py-1 [scrollbar-color:var(--ink-muted)_transparent] [scrollbar-width:thin]">
        <div className="flex w-max items-center gap-2">
          <Button type="button" aria-pressed={!value} onClick={() => onValueChange("")} className={categoryButtonClass(!value)}>
            {!value && <Check aria-hidden="true" className="size-4" />}{t("common.all")}
          </Button>
          {categories.map(category => (
            <Button key={category.id} type="button" aria-pressed={value === category.slug} onClick={() => onValueChange(category.slug)} className={categoryButtonClass(value === category.slug)}>
              {value === category.slug && <Check aria-hidden="true" className="size-4" />}{pick(category.nameEn, category.nameDe)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
