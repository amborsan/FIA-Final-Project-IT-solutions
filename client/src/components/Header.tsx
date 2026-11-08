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
  const [accountOpen, setAccountOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    void navigate({ to: "/" });
  }

  const languageButton = (code: Language, label: string) => (
    <button
      type="button"
      onClick={() => setLanguage(code)}
      className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
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
    <header className="sticky top-0 z-40 border-b border-base-300/70 bg-base-100/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="text-xl font-bold tracking-tight sm:text-2xl">{t("nav.brand")}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-base-content/70 transition hover:bg-base-200 hover:text-base-content"
              activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-semibold text-primary" }}
              activeOptions={{ exact: link.to === "/" }}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden items-center gap-0.5 rounded-lg border border-base-300 p-0.5 sm:flex">
            {languageButton("en", "EN")}
            {languageButton("de", "DE")}
          </div>

          <Link
            to="/cart"
            className="ds-btn ds-btn-ghost ds-btn-sm relative"
            aria-label={t("nav.cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="ds-badge ds-badge-primary ds-badge-sm absolute -right-1 -top-1 min-w-5 px-1">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="ds-dropdown ds-dropdown-end hidden sm:block" data-open={accountOpen}
              onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false); }}
              onKeyDown={(event) => { if (event.key === "Escape") { setAccountOpen(false); event.currentTarget.querySelector("button")?.focus(); } }}>
              <button type="button" aria-expanded={accountOpen} aria-controls="account-links" onClick={() => setAccountOpen(!accountOpen)} className="ds-btn ds-btn-ghost ds-btn-sm gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">
                  {user.fullName
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="max-w-28 truncate text-xs font-semibold">{user.fullName}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              <ul
                id="account-links" hidden={!accountOpen} onClick={() => setAccountOpen(false)}
                className="ds-dropdown-content ds-menu z-50 mt-2 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
              >
                <li className="ds-menu-title px-3 py-1 text-[11px] uppercase tracking-wide">
                  {t(`role.${user.role}` as "role.ADMIN")}
                </li>
                <li>
                  <Link to={dashboardPath(user.role)}>
                    <LayoutDashboard className="h-4 w-4" />
                    {t("portal.dashboard")}
                  </Link>
                </li>
                <li>
                  <Link to="/messages">
                    <MessageSquare className="h-4 w-4" />
                    {t("nav.messages")}
                  </Link>
                </li>
                <li>
                  <Link to={user.role === "CUSTOMER" ? "/portal/profile" : "/account"}>
                    <UserRound className="h-4 w-4" />
                    {t("nav.account")}
                  </Link>
                </li>
                <li className="mt-1 border-t border-base-200 pt-1">
                  <button onClick={handleLogout} className="text-error">
                    <LogOut className="h-4 w-4" />
                    {t("nav.logout")}
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link to="/login" className="ds-btn ds-btn-ghost ds-btn-sm">
                {t("nav.login")}
              </Link>
              <Link to="/quote" search={{ service: undefined }} className="ds-btn ds-btn-primary ds-btn-sm">
                {t("nav.quote")}
              </Link>
            </div>
          )}

          <button
            type="button"
            className="ds-btn ds-btn-ghost ds-btn-sm lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            onKeyDown={(event) => { if (event.key === "Escape") setMobileOpen(false); }}
            aria-label={t("nav.menu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-base-300 bg-base-100 px-4 pb-5 pt-3 lg:hidden">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-0.5 rounded-lg border border-base-300 p-0.5">
              {languageButton("en", "EN")}
              {languageButton("de", "DE")}
            </div>
            {user && <span className="text-xs text-base-content/70">{user.email}</span>}
          </div>
          <nav className="grid gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-base-content/75 hover:bg-base-200"
              >
                {t(link.key)}
              </Link>
            ))}
            <Link
              to="/quote" search={{ service: undefined }}
              onClick={() => setMobileOpen(false)}
              className="mt-2 ds-btn ds-btn-primary ds-btn-sm"
            >
              {t("nav.quote")}
            </Link>
            {user ? (
              <>
                <Link
                  to={dashboardPath(user.role)}
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-base-200"
                >
                  {t("portal.dashboard")}
                </Link>
                <Link
                  to={user.role === "CUSTOMER" ? "/portal/profile" : "/account"}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-base-200"
                >
                  {t("nav.account")}
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-base-200"
                >
                  {t("nav.messages")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error hover:bg-base-200"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-base-200"
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
