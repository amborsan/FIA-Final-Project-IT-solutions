import { useState } from "react";

// Small helpers shared by the dashboard lists. Keeping them pure makes the
// pages easy to read: filter the array, then paginate it.

export type ArchiveMode = "active" | "archived" | "all";

export type Paginated<T> = {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
};

/** True when any of the given values contains the search term. */
export function matchesSearch(
  term: string,
  ...values: (string | number | null | undefined)[]
): boolean {
  const query = term.trim().toLowerCase();
  if (!query) return true;
  return values.some((value) => String(value ?? "").toLowerCase().includes(query));
}

/** Keep active records, archived records, or everything. */
export function filterByArchive<T>(
  items: T[],
  mode: ArchiveMode,
  isArchived: (item: T) => boolean,
): T[] {
  if (mode === "all") return items;
  return items.filter((item) => isArchived(item) === (mode === "archived"));
}

/** Slice one page and clamp the page number after filtering changed the total. */
export function paginate<T>(items: T[], requestedPage: number, pageSize: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}

/**
 * Search/filter/page state for one list. Every filter change resets the page so
 * the user never lands on an empty page after narrowing the results.
 */
export function useListControls(initialPageSize = 10) {
  const [search, setSearchValue] = useState("");
  const [status, setStatusValue] = useState("");
  const [archive, setArchiveValue] = useState<ArchiveMode>("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeValue] = useState(initialPageSize);

  function setSearch(value: string) {
    setSearchValue(value);
    setPage(1);
  }

  function setStatus(value: string) {
    setStatusValue(value);
    setPage(1);
  }

  function setArchive(value: ArchiveMode) {
    setArchiveValue(value);
    setPage(1);
  }

  function setPageSize(value: number) {
    setPageSizeValue(value);
    setPage(1);
  }

  function reset() {
    setSearchValue("");
    setStatusValue("");
    setArchiveValue("active");
    setPage(1);
  }

  return {
    search,
    setSearch,
    status,
    setStatus,
    archive,
    setArchive,
    page,
    setPage,
    pageSize,
    setPageSize,
    reset,
  };
}
