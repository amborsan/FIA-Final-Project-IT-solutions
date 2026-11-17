import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useEffect, useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { ProductCategory, Service } from "../lib/types";
import { HeaderNavigation, publicLinks } from "./HeaderNavigation";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ThemeToggle } from "./ThemeToggle";
import { BrandLogo } from "./BrandLogo";
import { HeaderDrawer } from "./beui/HeaderDrawer";
import { useI18n } from "../i18n/I18nContext";
import type { Language } from "../i18n/translations";

function dashboardPath(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "TECHNICIAN") return "/technician";
  return "/portal";
}

export function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { t, pick, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileId = useId();
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setMobileOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const servicesQuery = useQuery({
    queryKey: ["services", "footer"],
    queryFn: () => api<{ services: Service[] }>("/services"),
    staleTime: 10 * 60 * 1000,
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<{ categories: ProductCategory[] }>("/categories"),
    staleTime: 10 * 60 * 1000,
  });

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    void navigate({ to: "/" });
  }

  const languageButton = (code: Language, label: string) => (
    <button
      type="button"
      onClick={() => setLanguage(code)}
      className={`rounded-pill px-2 py-1 text-xs font-semibold transition ${
        language === code
          ? "bg-primary text-primary-content"
          : "text-base-content/70 hover:bg-base-200"
      }`}
      aria-pressed={language === code}
    >
      {label}
    </button>
  );

  return (
    <header className="site-header sticky top-0 z-40 border-b border-base-300/70 bg-surface">
      <div className="container-page flex h-nav items-center justify-between gap-1 sm:gap-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <BrandLogo />
        </Link>

        <HeaderNavigation services={servicesQuery.data?.services ?? []} categories={categoriesQuery.data?.categories ?? []} />

        <div className="flex items-center gap-0 sm:gap-1.5">
          <div className="hidden items-center gap-0.5 rounded-pill border border-base-300 p-0.5 sm:flex">
            {languageButton("en", "EN")}
            {languageButton("de", "DE")}
          </div>

          <ThemeToggle />

          <Link
            to="/cart"
            className={cn(
              buttonVariants(),
              " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm relative",
            )}
            aria-label={t("nav.cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <Badge
                className={cn(
                  " bg-primary text-primary-content border-primary h-5 text-xs absolute -right-1 -top-1 min-w-5 px-1",
                )}
              >
                {count}
              </Badge>
            )}
          </Link>

          {user ? (
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    className={cn(
                      " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm gap-1.5",
                    )}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">
                      {user.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span className="max-w-28 truncate text-xs font-semibold">
                      {user.fullName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
                >
                  <DropdownMenuLabel className="px-3 py-1 text-[11px] uppercase tracking-wide text-base-content/60">
                    {t(`role.${user.role}` as "role.ADMIN")}
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to={dashboardPath(user.role)}>
                      <LayoutDashboard className="h-4 w-4" />
                      {t("portal.dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages">
                      <MessageSquare className="h-4 w-4" />
                      {t("nav.messages")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to={
                        user.role === "CUSTOMER"
                          ? "/portal/profile"
                          : "/account"
                      }
                    >
                      <UserRound className="h-4 w-4" />
                      {t("nav.account")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => void handleLogout()}
                    className="text-error focus:text-error"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link
                to="/login"
                className={cn(
                  buttonVariants(),
                  " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm",
                )}
              >
                {t("nav.login")}
              </Link>
              <Link
                to="/quote"
                search={{ service: undefined }}
                className={cn(
                  buttonVariants(),
                  " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
                )}
              >
                {t("nav.quote")}
              </Link>
            </div>
          )}

          <HeaderDrawer
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            id={mobileId}
            title={t("nav.menu")}
            closeLabel={t("nav.closeMenu")}
            trigger={
              <Button
                type="button"
                className="border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm xl:hidden"
                aria-label={t("nav.menu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            }
          >
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-0.5 rounded-pill border border-base-300 p-0.5">
              {languageButton("en", "EN")}
              {languageButton("de", "DE")}
            </div>
            {user && (
              <span className="min-w-0 break-all text-right text-xs text-base-content/70">{user.email}</span>
            )}
          </div>
          <nav aria-label={t("nav.primary")} className="grid gap-1">
            {publicLinks.map((link) => (
              <div key={link.to}>
                {link.to === "/products" ? (
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-pill px-3 py-2.5 text-sm font-medium text-base-content/75 hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                      {t(link.key)}
                      <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                    </summary>
                    <ul className="ml-4 grid gap-1 border-l border-hairline pl-2">
                      <li>
                        <Link to="/products" search={{ category: undefined }} onClick={() => setMobileOpen(false)} className="block rounded-pill px-3 py-2.5 text-sm text-ink-soft hover:bg-accent-sky focus-visible:outline-2 focus-visible:outline-ring">
                          {t("nav.allProducts")}
                        </Link>
                      </li>
                      {(categoriesQuery.data?.categories ?? []).map(entry => (
                        <li key={entry.id}>
                          <Link to="/products" search={{ category: entry.slug }} onClick={() => setMobileOpen(false)} className="block rounded-pill px-3 py-2.5 text-sm text-ink-soft hover:bg-accent-sky focus-visible:outline-2 focus-visible:outline-ring">
                            {pick(entry.nameEn, entry.nameDe)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-pill px-3 py-2.5 text-sm font-medium text-base-content/75 hover:bg-base-200"
                  >
                    {t(link.key)}
                  </Link>
                )}
              </div>
            ))}
            <Link
              to="/quote"
              search={{ service: undefined }}
              onClick={() => setMobileOpen(false)}
              className={cn(
                buttonVariants(),
                "mt-2  bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
              )}
            >
              {t("nav.quote")}
            </Link>
            {user ? (
              <>
                <Link
                  to={dashboardPath(user.role)}
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 rounded-pill px-3 py-2.5 text-sm font-medium hover:bg-base-200"
                >
                  {t("portal.dashboard")}
                </Link>
                <Link
                  to={user.role === "CUSTOMER" ? "/portal/profile" : "/account"}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-pill px-3 py-2.5 text-sm font-medium hover:bg-base-200"
                >
                  {t("nav.account")}
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-pill px-3 py-2.5 text-sm font-medium hover:bg-base-200"
                >
                  {t("nav.messages")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-pill px-3 py-2.5 text-left text-sm font-medium text-error hover:bg-base-200"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-pill px-3 py-2.5 text-sm font-medium hover:bg-base-200"
              >
                {t("nav.login")}
              </Link>
            )}
          </nav>
          </HeaderDrawer>
        </div>
      </div>

    </header>
  );
}
