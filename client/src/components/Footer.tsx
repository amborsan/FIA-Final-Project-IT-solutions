import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { api } from "../lib/api";
import type { Service } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { BrandLogo } from "./BrandLogo";
import { buttonVariants } from "./ui/button";
import { cn } from "../lib/utils";

export function Footer() {
  const { t, pick } = useI18n();
  const { data } = useQuery({
    queryKey: ["services", "footer"],
    queryFn: () => api<{ services: Service[] }>("/services"),
    staleTime: 10 * 60 * 1000,
  });
  const services = (data?.services ?? []).slice(0, 6);
  const companyLinks = [
    ["/about", "nav.about"], ["/services", "nav.services"], ["/products", "nav.products"],
    ["/blog", "nav.blog"], ["/contact", "nav.contact"],
  ] as const;
  const legalLinks = [
    ["/legal/privacy", "footer.privacy"], ["/legal/terms", "footer.terms"],
    ["/legal/withdrawal", "footer.withdrawal"], ["/legal/imprint", "footer.imprint"],
    ["/legal/cookies", "footer.cookies"],
  ] as const;

  return (
    <footer className="site-footer mt-auto border-t border-hairline bg-surface text-ink">
      <div className="bg-canvas">
        <div className="container-page footer-cta">
          <div className="max-w-xl">
            <h2 className="footer-cta-title">{t("footer.ctaTitle")}</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">{t("footer.ctaText")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/quote" search={{ service: undefined }} className={cn(buttonVariants(), "group")}>
              {t("home.ctaQuote")}
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
            </Link>
            <Link to="/contact" className="footer-link text-sm">{t("nav.contact")}</Link>
          </div>
        </div>
      </div>

      <div className="container-page footer-main">
        <div>
          <Link to="/" className="footer-link inline-flex"><BrandLogo /></Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">{t("footer.tagline")}</p>
          <address className="mt-6 grid gap-3 text-sm not-italic text-ink-soft">
            <p className="flex items-start gap-3"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span>Hauptstraße 12, 10115 Berlin</span></p>
            <a href="tel:+493055500100" className="footer-link flex w-fit items-center gap-3"><Phone aria-hidden="true" className="size-4 shrink-0" />+49 30 5550 0100</a>
            <a href="mailto:hello@fia-it.de" className="footer-link flex w-fit items-center gap-3"><Mail aria-hidden="true" className="size-4 shrink-0" />hello@fia-it.de</a>
          </address>
        </div>
        <div className="footer-navigation">
          <nav aria-label={t("footer.company")}>
            <h2 className="text-sm font-medium text-ink">{t("footer.company")}</h2>
            <ul className="mt-5 grid gap-3 text-sm text-ink-muted">
              {companyLinks.map(([to, key]) => <li key={to}><Link to={to} className="footer-link">{t(key)}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label={t("footer.services")}>
            <h2 className="text-sm font-medium text-ink">{t("footer.services")}</h2>
            <ul className="mt-5 grid gap-3 text-sm text-ink-muted">
              {services.map(service => <li key={service.id}>
                <Link to="/services/$slug" params={{ slug: service.slug }} className="footer-link">{pick(service.nameEn, service.nameDe)}</Link>
              </li>)}
              {services.length === 0 && <li><Link to="/services" className="footer-link">{t("nav.services")}</Link></li>}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="container-page footer-legal">
          <div className="footer-legal-row">
            <p>© {new Date().getFullYear()} {t("brand.name")} {t("footer.rights")}</p>
            <nav aria-label={t("footer.legal")}>
              <ul className="flex flex-wrap gap-x-5 gap-y-3">
                {legalLinks.map(([to, key]) => <li key={to}><Link to={to} className="footer-link">{t(key)}</Link></li>)}
                <li><button type="button" className="footer-link cursor-pointer" onClick={() => window.dispatchEvent(new Event("orbit:open-cookie-settings"))}>{t("legal.cookieSettings")}</button></li>
              </ul>
            </nav>
          </div>
          <div className="mt-5 flex flex-col gap-2 leading-relaxed sm:flex-row sm:flex-wrap sm:justify-between">
            <p>{t("footer.madeIn")}</p><p>{t("footer.demo")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
