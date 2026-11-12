import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, ShieldCheck } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

const STORAGE_KEY = "orbit_cookie_consent";

type Consent = {
  essential: true;
  analytics: false;
  date: string;
};

function hasConsent(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

/**
 * The site only sets essential cookies (session + CSRF). This banner explains
 * that and lets visitors record their choice. No marketing or analytics scripts
 * are loaded, so there is nothing optional to switch on.
 */
export function CookieConsent() {
  const { t } = useI18n();
  const [open, setOpen] = useState(() => !hasConsent());
  const [details, setDetails] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
      setDetails(true);
    }
    window.addEventListener("orbit:open-cookie-settings", handleOpen);
    return () => window.removeEventListener("orbit:open-cookie-settings", handleOpen);
  }, []);

  function save() {
    const consent: Consent = {
      essential: true,
      analytics: false,
      date: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setOpen(false);
    setDetails(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl sm:inset-x-6 sm:bottom-5">
      <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Cookie className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold sm:text-base">{t("cookie.title")}</h2>
            <p className="mt-1 text-xs leading-relaxed text-base-content/65 sm:text-sm">
              {t("cookie.text")}{" "}
              <Link to="/legal/privacy" className={cn("underline cursor-pointer text-primary")}>
                {t("cookie.privacyLink")}
              </Link>
            </p>

            {details && (
              <div className="mt-3 space-y-2 rounded-lg bg-base-200 p-3 text-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{t("cookie.essential")}</p>
                    <p className="text-base-content/70">{t("cookie.essentialText")}</p>
                  </div>
                  <Badge className={cn(" bg-success text-success-content border-success h-5 text-xs")}>ON</Badge>
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-base-300 pt-2">
                  <div>
                    <p className="font-semibold">{t("cookie.analytics")}</p>
                    <p className="text-base-content/70">{t("cookie.analyticsText")}</p>
                  </div>
                  <Badge className={cn(" bg-base-200 text-base-content h-5 text-xs")}>OFF</Badge>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button className={cn(" bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm")} onClick={() => save()}>
                {t("cookie.acceptAll")}
              </Button>
              <Button className={cn(" border-current bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm")} onClick={() => save()}>
                {t("cookie.essentialOnly")}
              </Button>
              <Button
                className={cn(" border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm")}
                onClick={() => setDetails((value) => !value)}
              >
                {t("cookie.settings")}
              </Button>
              <span className="ml-auto hidden items-center gap-1 text-[11px] text-base-content/65 sm:flex">
                <ShieldCheck className="h-3.5 w-3.5" /> GDPR
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
