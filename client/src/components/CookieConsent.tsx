import { Button } from "@/components/ui/button";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

const STORAGE_KEY = "orbit_cookie_consent";
type Consent = { essential: true; analytics: false; date: string };

function hasConsent(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

/** Informational only: session/CSRF stay active; optional tracking stays off. */
export function CookieConsent() {
  const { t } = useI18n();
  const [open, setOpen] = useState(() => !hasConsent());
  const [details, setDetails] = useState(false);
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const focusRequested = useRef(false);

  useEffect(() => {
    function handleOpen() {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      focusRequested.current = true;
      heading.current?.focus();
      setOpen(true);
      setDetails(true);
    }
    window.addEventListener("orbit:open-cookie-settings", handleOpen);
    return () => window.removeEventListener("orbit:open-cookie-settings", handleOpen);
  }, []);

  useEffect(() => {
    if (open && details && focusRequested.current) {
      heading.current?.focus();
      focusRequested.current = false;
    }
  }, [open, details]);

  function save() {
    const consent: Consent = { essential: true, analytics: false, date: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setOpen(false);
    setDetails(false);
    returnFocus.current?.focus();
    returnFocus.current = null;
  }

  if (!open) return null;

  return (
    <section aria-labelledby={`${id}-title`} className="border-b border-hairline bg-canvas text-ink">
      <div className="container-page py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="min-w-0 max-w-3xl">
            <h2 ref={heading} id={`${id}-title`} tabIndex={-1} className="text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {t("cookie.title")}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t("cookie.text")}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="ghost" className="px-3 lg:px-6" aria-expanded={details} aria-controls={`${id}-details`} onClick={() => setDetails(value => !value)}>
              {t("cookie.details")}
              <ChevronDown aria-hidden="true" className={details ? "size-4 rotate-180" : "size-4"} />
            </Button>
            <Button className="px-3 lg:px-6" onClick={save}>{t("cookie.acknowledge")}</Button>
          </div>
        </div>
        <div id={`${id}-details`} hidden={!details} className="mt-3 border-t border-hairline pt-3">
          <dl className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="font-semibold">{t("cookie.essential")} · {t("cookie.active")}</dt>
              <dd className="mt-1 text-ink-muted">{t("cookie.essentialText")}</dd>
            </div>
            <div>
              <dt className="font-semibold">{t("cookie.analytics")} · {t("cookie.unused")}</dt>
              <dd className="mt-1 text-ink-muted">{t("cookie.analyticsText")}</dd>
            </div>
          </dl>
        </div>
        <Link to="/legal/privacy" className="mt-1 inline-flex min-h-11 items-center text-sm text-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
          {t("cookie.privacyLink")}
        </Link>
      </div>
    </section>
  );
}
