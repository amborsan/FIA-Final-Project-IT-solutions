// Adapted from https://beui.dev/components/motion/pagination.
export type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

export function paginationRange(page: number, totalPages: number, siblings = 1): PaginationItem[] {
  const range = (start: number, end: number) =>
    Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  const slots = siblings * 2 + 5;
  if (totalPages <= slots) return range(1, totalPages);
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, totalPages - 1);
  const showStart = left > 3;
  const showEnd = right < totalPages - 2;
  if (!showStart && showEnd) return [...range(1, siblings * 2 + 3), "ellipsis-end", totalPages];
  if (showStart && !showEnd) return [1, "ellipsis-start", ...range(totalPages - (2 + siblings * 2), totalPages)];
  return [1, "ellipsis-start", ...range(left, right), "ellipsis-end", totalPages];
}
