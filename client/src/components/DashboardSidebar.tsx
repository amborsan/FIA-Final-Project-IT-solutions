import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { PanelLeft, X } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import type { DashboardNavItem } from "./DashboardShell";
import {
  AnimatedSidebar,
  AnimatedSidebarClose,
  AnimatedSidebarContent,
  AnimatedSidebarHeader,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarTrigger,
  useAnimatedSidebar,
} from "./beui/AnimatedSidebar";
import type { ReactNode } from "react";
import "./DashboardSidebar.css";

const STORAGE_KEY = "fia_sidebar_expanded";

function SidebarToggle({ mobile = false }: { mobile?: boolean }) {
  const { isMobile } = useAnimatedSidebar();
  const { t } = useI18n();
  if (isMobile !== mobile) return null;
  return <AnimatedSidebarTrigger className="dashboard-sidebar-control">
    <PanelLeft aria-hidden="true" className="size-5" />
    {mobile && <span>{t("sidebar.label")}</span>}
  </AnimatedSidebarTrigger>;
}

function SidebarClose() {
  const { isMobile } = useAnimatedSidebar();
  return isMobile ? <AnimatedSidebarClose className="dashboard-sidebar-control dashboard-mobile-close">
    <X aria-hidden="true" className="size-5" />
  </AnimatedSidebarClose> : null;
}

export function DashboardSidebar({ nav, children }: { nav: DashboardNavItem[]; children: ReactNode }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname.replace(/\/$/, "") });
  const [open, setOpen] = useState(() => localStorage.getItem(STORAGE_KEY) !== "false");
  return (
    <AnimatedSidebarProvider
      className="dashboard-layout"
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        localStorage.setItem(STORAGE_KEY, String(next));
      }}
      labels={{ label: t("sidebar.label"), toggle: t("sidebar.toggle"), close: t("sidebar.close") }}
    >
      <div className="dashboard-mobile-toggle">
        <SidebarToggle mobile />
      </div>
      <AnimatedSidebar className="dashboard-sidebar" panelClassName="dashboard-sidebar-panel">
        <AnimatedSidebarHeader className="dashboard-sidebar-header">
          <span className="dashboard-sidebar-heading">{t("sidebar.label")}</span>
          <SidebarToggle />
          <SidebarClose />
        </AnimatedSidebarHeader>
        <AnimatedSidebarContent>
          <nav aria-label={t("sidebar.label")}>
            <AnimatedSidebarMenu>
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.to || (!item.exact && pathname.startsWith(`${item.to}/`));
                return (
                  <AnimatedSidebarMenuItem key={item.to}>
                    <AnimatedSidebarMenuButton
                      href={item.to}
                      isActive={isActive}
                      icon={<Icon aria-hidden="true" className="size-5" />}
                      onSelect={(event) => {
                        // Preserve real anchors, modified clicks and the existing SPA router.
                        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                        event.preventDefault();
                        void navigate({ to: item.to as "/" });
                      }}
                      className="dashboard-sidebar-link"
                    >
                      {item.label}
                    </AnimatedSidebarMenuButton>
                  </AnimatedSidebarMenuItem>
                );
              })}
            </AnimatedSidebarMenu>
          </nav>
        </AnimatedSidebarContent>
      </AnimatedSidebar>
      {children}
    </AnimatedSidebarProvider>
  );
}
