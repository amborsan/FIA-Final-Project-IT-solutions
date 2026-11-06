import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import type { ArchiveMode } from "../lib/list";

export function ListToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">{children}</div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <label className={`input input-bordered flex w-full items-center gap-2 sm:max-w-md ${className}`}>
      <Search className="h-4 w-4 shrink-0 opacity-50" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="grow"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="btn btn-ghost btn-xs btn-circle"
          aria-label={t("common.clear")}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  );
}

export type FilterOption = {
  value: string;
  label: string;
};

export function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
  ariaLabel,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  allLabel: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`select select-bordered w-full sm:w-auto ${className}`}
      aria-label={ariaLabel}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ArchiveTabs({
  value,
  onChange,
}: {
  value: ArchiveMode;
  onChange: (mode: ArchiveMode) => void;
}) {
  const { t } = useI18n();
  const options: { mode: ArchiveMode; label: string }[] = [
    { mode: "active", label: t("list.activeTab") },
    { mode: "archived", label: t("list.archiveTab") },
    { mode: "all", label: t("list.allTab") },
  ];

  return (
    <div role="tablist" aria-label={t("list.archiveLabel")} className="join w-full sm:w-auto">
      {options.map((option) => (
        <button
          key={option.mode}
          type="button"
          role="tab"
          aria-selected={value === option.mode}
          onClick={() => onChange(option.mode)}
          className={`btn btn-sm join-item flex-1 sm:flex-none ${
            value === option.mode ? "btn-primary" : "btn-ghost border-base-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  from,
  to,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const { t } = useI18n();

  if (total === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-base-200 pt-3 text-xs text-base-content/70 sm:flex-row sm:items-center sm:justify-between">
      <p>{t("list.showing", { from, to, total })}</p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5">
          <span>{t("list.rows")}</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="select select-bordered select-xs"
            aria-label={t("list.rows")}
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="join">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="btn btn-sm join-item"
            aria-label={t("list.previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="btn btn-ghost btn-sm join-item pointer-events-none">
            {t("list.pageOf", { page, pages: totalPages })}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="btn btn-sm join-item"
            aria-label={t("list.next")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
