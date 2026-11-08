import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, FileText, ShieldCheck } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";

const links: { to: string; key: TranslationKey }[] = [
  { to: "/legal/privacy", key: "legal.privacyTitle" },
  { to: "/legal/terms", key: "legal.termsTitle" },
  { to: "/legal/withdrawal", key: "legal.withdrawalTitle" },
  { to: "/legal/imprint", key: "legal.imprintTitle" },
  { to: "/legal/cookies", key: "legal.cookiesTitle" },
];

export function LegalShell({
  titleKey,
  introKey,
  children,
}: {
  titleKey: TranslationKey;
  introKey: TranslationKey;
  children: ReactNode;
}) {
  const { t, language } = useI18n();

  return (
    <div className="bg-base-100">
      <section className="border-b border-base-300 bg-base-200/40">
        <div className="container-page py-10 sm:py-14">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-4 w-4" /> {language === "de" ? "Rechtliches" : "Legal"}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{t(titleKey)}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-base-content/65">{t(introKey)}</p>
          <p className="mt-3 text-[11px] text-base-content/70">
            {t("legal.lastUpdated")}:{" "}
            {language === "de" ? "1. November 2026" : "1 November 2026"}
          </p>
        </div>
      </section>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_240px] lg:items-start">
        <article className="legal-copy min-w-0">{children}</article>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-box border border-base-300 bg-base-100 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/65">
              <FileText className="h-3.5 w-3.5" /> {language === "de" ? "Dokumente" : "Documents"}
            </p>
            <nav className="mt-3 grid gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-2.5 py-2 text-sm text-base-content/65 hover:bg-base-200 hover:text-primary"
                  activeProps={{ className: "rounded-lg px-2.5 py-2 text-sm font-semibold bg-primary/10 text-primary" }}
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("orbit:open-cookie-settings"))}
              className="mt-3 w-full rounded-lg bg-base-200 px-2.5 py-2 text-left text-xs font-semibold hover:bg-base-300"
            >
              {t("legal.cookieSettings")}
            </button>
          </div>

          <div className="rounded-box border border-warning/30 bg-warning/10 p-4">
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-base-content/65">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              {t("legal.legalNotice")}
            </p>
          </div>
        </aside>
      </div>

      <div className="container-page pb-10">
        <div className="rounded-box bg-base-200 p-4 text-sm">
          <p className="font-semibold">{t("legal.questions")}</p>
          <p className="mt-1 text-xs text-base-content/70">
            <a href="mailto:privacy@orbit-it.de" className="ds-link ds-link-primary">
              privacy@orbit-it.de
            </a>{" "}
            ·{" "}
            <Link to="/contact" className="ds-link ds-link-primary">
              {t("nav.contact")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
