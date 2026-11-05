import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Orbit, Phone } from "lucide-react";
import { api } from "../lib/api";
import type { Service } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";

export function Footer() {
  const { t, pick } = useI18n();
  const { data } = useQuery({
    queryKey: ["services", "footer"],
    queryFn: () => api<{ services: Service[] }>("/services"),
    staleTime: 10 * 60 * 1000,
  });

  const services = (data?.services ?? []).slice(0, 6);

  return (
    <footer className="mt-auto border-t border-white/10 bg-[oklch(24%_0.035_250)] text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Orbit className="h-5 w-5" />
            </span>
            <span className="text-base font-bold">Orbit IT Solutions</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            {t("footer.tagline")}
          </p>
          <div className="mt-5 space-y-2 text-sm text-white/65">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" /> Hauptstraße 12, 10115
              Berlin
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" /> +49 30 5550 0100
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" /> hello@fia-it.de
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
            {t("footer.quickLinks")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {[
              ["/services", "nav.services"],
              ["/products", "nav.products"],
              ["/about", "nav.about"],
              ["/blog", "nav.blog"],
              ["/contact", "nav.contact"],
              ["/quote", "nav.quote"],
            ].map(([to, key]) => (
              <li key={to}>
                <Link to={to} className="transition hover:text-white">
                  {t(key as "nav.home")}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
            {t("footer.services")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {services.map((service) => (
              <li key={service.id}>
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="transition hover:text-white"
                >
                  {pick(service.nameEn, service.nameDe)}
                </Link>
              </li>
            ))}
            {services.length === 0 && (
              <li>
                <Link to="/services" className="transition hover:text-white">
                  {t("nav.services")}
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
            {t("footer.legal")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li>
              <Link to="/legal/privacy" className="transition hover:text-white">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link to="/legal/terms" className="transition hover:text-white">
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <Link
                to="/legal/withdrawal"
                className="transition hover:text-white"
              >
                {t("footer.withdrawal")}
              </Link>
            </li>
            <li>
              <Link to="/legal/imprint" className="transition hover:text-white">
                {t("footer.imprint")}
              </Link>
            </li>
            <li>
              <Link to="/legal/cookies" className="transition hover:text-white">
                {t("footer.cookies")}
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("orbit:open-cookie-settings"))
                }
                className="transition hover:text-white"
              >
                {t("legal.cookieSettings")}
              </button>
            </li>
          </ul>
          <p className="mt-6 rounded-lg bg-white/5 p-3 text-xs leading-relaxed text-white/65">
            {t("footer.demo")}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/65 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Orbit IT Solutions GmbH.{" "}
            {t("footer.rights")}
          </p>
          <p>{t("footer.madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
