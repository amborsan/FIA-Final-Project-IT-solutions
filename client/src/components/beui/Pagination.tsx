// Adapted from Be UI Animated Pagination; uses the project's controlled list state and i18n.
import { useId, useLayoutEffect, useRef, useSyncExternalStore, type ComponentPropsWithoutRef } from "react";
import { AnimatePresence, LayoutGroup, motion, useIsPresent, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext";
import { cn } from "../../lib/utils";
import { EASE_OUT, SPRING_LAYOUT } from "./ease";
import { paginationRange } from "./paginationRange";

const desktopQuery = "(min-width: 640px)";
function subscribeWidth(notify: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
const isWide = () => window.matchMedia(desktopQuery).matches;
const controlClass = "relative inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-full px-2 text-sm tabular-nums outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

function PageButton(props: ComponentPropsWithoutRef<"button">) {
  const present = useIsPresent();
  // Exiting pages remain visible briefly, but must immediately leave the tab order.
  return <button {...props} type="button" inert={!present} aria-hidden={!present || undefined}
    style={{ pointerEvents: present ? "auto" : "none" }} />;
}

export function AnimatedPagination({ page, totalPages, onPageChange }: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useI18n();
  const id = useId();
  const reduce = useReducedMotion();
  const wide = useSyncExternalStore(subscribeWidth, isWide, () => false);
  const nav = useRef<HTMLElement>(null);
  const keyboardTarget = useRef<number | null>(null);
  const total = Math.max(1, Math.floor(totalPages));
  const current = Math.max(1, Math.min(total, page));
  const items = paginationRange(current, total, wide ? 1 : 0);
  const fade = { duration: reduce ? 0 : 0.16, ease: EASE_OUT };

  useLayoutEffect(() => {
    if (keyboardTarget.current !== current) return;
    nav.current?.querySelector<HTMLButtonElement>('button[aria-current="page"]:not([inert])')?.focus();
    keyboardTarget.current = null;
  }, [current]);

  function go(target: number, keyboard: boolean) {
    const next = Math.max(1, Math.min(total, target));
    if (next === current) return;
    if (keyboard) keyboardTarget.current = next;
    onPageChange(next);
  }

  return (
    <nav ref={nav} aria-label={t("list.pagination")} className="min-w-0">
      <LayoutGroup id={id}>
        <ul className="relative flex items-center gap-0.5">
          <li><PageButton className={cn(controlClass, "text-ink-muted hover:text-ink")}
            aria-label={t("list.previous")} disabled={current === 1}
            onClick={event => go(current - 1, event.detail === 0)}><ChevronLeft aria-hidden="true" className="size-4" /></PageButton></li>
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map(item => {
              const numbered = typeof item === "number";
              const active = numbered && item === current;
              const back = item === "ellipsis-start";
              const target = numbered ? item : Math.max(1, Math.min(total, current + (back ? -5 : 5)));
              const JumpIcon = back ? ChevronsLeft : ChevronsRight;
              return (
                <motion.li key={item} layout={reduce ? false : "position"}
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reduce ? 1 : 0.8, transition: fade }}
                  transition={{ layout: SPRING_LAYOUT, opacity: fade, scale: reduce ? { duration: 0 } : SPRING_LAYOUT }}>
                  <PageButton className={cn(controlClass, "group", active ? "font-medium text-canvas" : "text-ink-muted hover:bg-ink/5 hover:text-ink")}
                    aria-current={active ? "page" : undefined}
                    aria-label={numbered ? t("list.pageLabel", { page: item }) : t(back ? "list.jumpBack" : "list.jumpForward", { count: Math.abs(target - current) })}
                    onClick={event => go(target, event.detail === 0)}>
                    {numbered ? <>
                      {active && <motion.span aria-hidden="true" layoutId={reduce ? undefined : "pagination-current"}
                        transition={SPRING_LAYOUT} className="absolute inset-0 rounded-full bg-ink" />}
                      <span className="relative">{item}</span>
                    </> : <>
                      <span aria-hidden="true" className="transition-opacity duration-150 group-hover:opacity-0 group-focus-visible:opacity-0">…</span>
                      <JumpIcon aria-hidden="true" className="absolute size-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100" />
                    </>}
                  </PageButton>
                </motion.li>
              );
            })}
          </AnimatePresence>
          <li><PageButton className={cn(controlClass, "text-ink-muted hover:text-ink")}
            aria-label={t("list.next")} disabled={current === total}
            onClick={event => go(current + 1, event.detail === 0)}><ChevronRight aria-hidden="true" className="size-4" /></PageButton></li>
        </ul>
      </LayoutGroup>
      <span className="sr-only" aria-live="polite" aria-atomic="true">{t("list.pageOf", { page: current, pages: total })}</span>
    </nav>
  );
}
