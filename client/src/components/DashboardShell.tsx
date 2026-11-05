import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export function DashboardShell({
  nav,
  title,
  subtitle,
  children,
  actions,
}: {
  nav: DashboardNavItem[];
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="container-page py-8">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex gap-1 overflow-x-auto rounded-box border border-base-300 bg-base-100 p-2 lg:flex-col lg:overflow-visible">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as "/"}
                  activeOptions={{ exact: item.exact }}
                  className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-base-content/65 transition hover:bg-base-200 hover:text-base-content"
                  activeProps={{
                    className:
                      "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold bg-primary/10 text-primary",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-base-content/70">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function Panel({
  title,
  text,
  children,
  action,
  className = "",
}: {
  title?: string;
  text?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-box border border-base-300 bg-base-100 p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            {title && <h2 className="text-base font-bold">{title}</h2>}
            {text && <p className="mt-0.5 text-xs text-base-content/65">{text}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
