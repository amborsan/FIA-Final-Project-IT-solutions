import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Check, Package } from "lucide-react";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { ServiceIcon } from "./ServiceIcon";
import { useI18n } from "../i18n/I18nContext";
import type { ProductCategory, Service } from "../lib/types";
import { getServiceGroupId, serviceGroups } from "../lib/serviceGroups";
import "./HeaderNavigation.css";

export const publicLinks = [
  { to: "/", key: "nav.home" },
  { to: "/services", key: "nav.services" },
  { to: "/products", key: "nav.products" },
  { to: "/about", key: "nav.about" },
  { to: "/blog", key: "nav.blog" },
  { to: "/contact", key: "nav.contact" },
] as const;

export function HeaderNavigation({ services, categories = [] }: { services: Service[]; categories?: ProductCategory[] }) {
  const { t, pick } = useI18n();
  const pathname = useRouterState({ select: state => state.location.pathname.replace(/\/$/, "") || "/" });
  const category = useRouterState({ select: state => (state.location.search as { category?: string }).category });
  const [value, setValue] = useState("");
  const isCurrent = (to: string) => pathname === to || (to !== "/" && pathname.startsWith(`${to}/`));
  return (
    <NavigationMenu aria-label={t("nav.primary")} viewport={false} value={value} onValueChange={setValue} className="header-navigation hidden xl:flex">
      <NavigationMenuList>
        {publicLinks.map(link => (
          <NavigationMenuItem key={link.to} value={link.to}>
            {link.to === "/services" ? <>
              <NavigationMenuTrigger className="header-nav-trigger" data-current={isCurrent(link.to)}>{t(link.key)}</NavigationMenuTrigger>
              <NavigationMenuContent className="header-nav-panel">
                <div className="border-b border-hairline p-5">
                  <h2 className="text-base font-medium">{t("services.title")}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{t("services.text")}</p>
                </div>
                <ul className="header-service-links grid gap-1 p-3">
                  {serviceGroups.map(group => (
                    <li key={group.id}>
                      <NavigationMenuLink asChild active={services.some(service => pathname === `/services/${service.slug}` && getServiceGroupId(service.slug) === group.id)} onSelect={() => setValue("")} className="header-service-link">
                        <Link to="/services" hash={group.id}>
                          <ServiceIcon name={group.icon} className="size-5 shrink-0" />
                          <span className="min-w-0">
                            <span className="block font-medium">{t(group.titleKey)}</span>
                            <span className="mt-1 block text-xs text-ink-muted">{t(group.descriptionKey)}</span>
                          </span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline p-3">
                  <NavigationMenuLink asChild active={pathname === "/services"} onSelect={() => setValue("")} className="header-nav-footer-link">
                    <Link to="/services">{t("nav.allServices")}<ArrowUpRight aria-hidden="true" className="size-4" /></Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild onSelect={() => setValue("")} className="header-nav-footer-link">
                    <Link to="/quote" search={{ service: undefined }}>{t("nav.quote")}<ArrowUpRight aria-hidden="true" className="size-4" /></Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </> : link.to === "/products" ? <>
              <NavigationMenuTrigger className="header-nav-trigger" data-current={isCurrent(link.to)}>{t(link.key)}</NavigationMenuTrigger>
              <NavigationMenuContent className="header-nav-panel">
                <div className="border-b border-hairline p-5">
                  <h2 className="text-base font-medium">{t("common.allCategories")}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{t("products.text")}</p>
                </div>
                {categories.length > 0 && <ul className="grid grid-cols-2 gap-1 p-3">
                  {categories.map(entry => (
                    <li key={entry.id}>
                      <NavigationMenuLink asChild active={pathname === "/products" && category === entry.slug} onSelect={() => setValue("")} className="header-service-link">
                        <Link to="/products" search={{ category: entry.slug }} activeOptions={{ exact: true }}>
                          {pathname === "/products" && category === entry.slug
                            ? <Check aria-hidden="true" className="size-5 shrink-0" />
                            : <Package aria-hidden="true" className="size-5 shrink-0" />}
                          <span className="min-w-0 [overflow-wrap:anywhere]">{pick(entry.nameEn, entry.nameDe)}</span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>}
                <div className="border-t border-hairline p-3">
                  <NavigationMenuLink asChild active={pathname === "/products" && !category} onSelect={() => setValue("")} className={pathname === "/products" && !category ? "header-nav-footer-link bg-accent-sky text-ink" : "header-nav-footer-link"}>
                    <Link to="/products" search={{ category: undefined }} activeOptions={{ exact: true }}>
                      {pathname === "/products" && !category && <Check aria-hidden="true" className="size-4 shrink-0" />}
                      {t("nav.allProducts")}<ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </> : <NavigationMenuLink asChild active={isCurrent(link.to)} onSelect={() => setValue("")} className="header-nav-link">
              <Link to={link.to} activeOptions={{ exact: link.to === "/" }}>{t(link.key)}</Link>
            </NavigationMenuLink>}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
