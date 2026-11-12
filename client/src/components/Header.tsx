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
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ThemeToggle } from "./ThemeToggle";
import { BrandLogo } from "./BrandLogo";
import { useI18n } from "../i18n/I18nContext";
import type { Language } from "../i18n/translations";

const publicLinks = [
  { to: "/", key: "nav.home" },
  { to: "/services", key: "nav.services" },
  { to: "/products", key: "nav.products" },
  { to: "/about", key: "nav.about" },
  { to: "/blog", key: "nav.blog" },
  { to: "/contact", key: "nav.contact" },
] as const;

function dashboardPath(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "TECHNICIAN") return "/technician";
  return "/portal";
}

export function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <header className="sticky top-0 z-40 border-b border-base-300/70 bg-surface">
      <div className="container-page flex h-nav items-center justify-between gap-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-pill px-3 py-2 text-sm font-medium text-base-content/70 transition hover:bg-base-200 hover:text-base-content"
              activeProps={{
                className:
                  "rounded-pill px-3 py-2 text-sm font-semibold text-primary",
              }}
              activeOptions={{ exact: link.to === "/" }}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
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

          <Button
            type="button"
            className={cn(
              " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm lg:hidden",
            )}
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={t("nav.menu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-base-300 bg-base-100 px-4 pb-5 pt-3 lg:hidden">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-0.5 rounded-pill border border-base-300 p-0.5">
              {languageButton("en", "EN")}
              {languageButton("de", "DE")}
            </div>
            {user && (
              <span className="text-xs text-base-content/70">{user.email}</span>
            )}
          </div>
          <nav className="grid gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-pill px-3 py-2.5 text-sm font-medium text-base-content/75 hover:bg-base-200"
              >
                {t(link.key)}
              </Link>
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
        </div>
      )}
    </header>
  );
}
