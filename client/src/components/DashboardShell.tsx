import type { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
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
      <DashboardSidebar nav={nav}>
        <div data-slot="dashboard-content" className="dashboard-content">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-base-content/70">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </DashboardSidebar>
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
    <section
      className={`rounded-box border border-base-300 bg-base-100 p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            {title && <h2 className="text-base font-bold">{title}</h2>}
            {text && (
              <p className="mt-0.5 text-xs text-base-content/65">{text}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
