import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import type { ArchiveMode } from "../lib/list";

export function ListToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      {children}
    </div>
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
    <label
      className={cn(
        `h-10 min-w-0 rounded-field border border-input bg-base-100 px-3 text-sm text-base-content outline-none focus-within:border-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary disabled:opacity-50 flex w-full items-center gap-2 sm:max-w-md ${className}`,
      )}
    >
      <Search className="h-4 w-4 shrink-0 opacity-50" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 grow bg-transparent outline-none"
      />
      {value && (
        <Button
          type="button"
          onClick={() => onChange("")}
          className={cn(
            " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs aspect-square rounded-full px-0",
          )}
          aria-label={t("common.clear")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
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
    <NativeSelect
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(` w-full sm:w-auto ${className}`)}
      aria-label={ariaLabel}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </NativeSelect>
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
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as ArchiveMode)}
      className="w-full sm:w-auto"
    >
      <TabsList
        aria-label={t("list.archiveLabel")}
        className="h-auto w-full gap-1 rounded-pill bg-transparent p-0 sm:w-auto"
      >
        {options.map((option) => (
          <TabsTrigger
            key={option.mode}
            value={option.mode}
            className={cn(
              buttonVariants(),
              "h-8 flex-1 rounded-pill border border-base-300 px-4 text-sm sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-content dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-content",
              value === option.mode
                ? "border-primary bg-primary text-primary-content"
                : "bg-transparent text-base-content hover:bg-base-content/10",
            )}
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
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
          <NativeSelect
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className={cn(" h-6 px-2 text-xs")}
            aria-label={t("list.rows")}
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </NativeSelect>
        </label>

        <div
          className={cn(
            "inline-flex [&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
          )}
        >
          <Button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={cn(" h-8 px-3 text-sm ")}
            aria-label={t("list.previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span
            className={cn(
              buttonVariants(),
              " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm pointer-events-none",
            )}
          >
            {t("list.pageOf", { page, pages: totalPages })}
          </span>
          <Button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={cn(" h-8 px-3 text-sm ")}
            aria-label={t("list.next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
