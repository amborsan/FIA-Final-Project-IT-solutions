import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useI18n } from "../i18n/I18nContext";
import type { Service } from "../lib/types";
import { ServiceIcon } from "./ServiceIcon";
import { BouncyAccordion } from "./beui/BouncyAccordion";
import { cn } from "../lib/utils";

const desktopQuery = "(min-width: 64rem)";
function subscribeLayout(notify: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
const isDesktop = () => window.matchMedia(desktopQuery).matches;

export function HomeServicesAccordion({ services }: { services: Service[] }) {
  const { t, pick, formatMoney } = useI18n();
  const desktop = useSyncExternalStore(subscribeLayout, isDesktop, () => false);
  const [active, setActive] = useState<string | null>(services[0]?.id ?? null);
  const items = services.map(service => ({
      id: service.id,
      title: pick(service.nameEn, service.nameDe),
      icon: <span aria-hidden="true"><ServiceIcon name={service.icon} className="size-5" /></span>,
      description: <>
        <p>{pick(service.descriptionEn, service.descriptionDe)}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-ink-soft">{service.startingPrice ? `${t("services.startingAt")} ${formatMoney(service.startingPrice)}` : ""}</span>
          <Link to="/services/$slug" params={{ slug: service.slug }}
            className="inline-flex min-h-control items-center gap-2 rounded-sm font-medium text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            {t("common.details")}<span className="sr-only"> — {pick(service.nameEn, service.nameDe)}</span><ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </>,
    }));
  const middle = Math.ceil(items.length / 2);
  const columns = desktop ? [items.slice(0, middle), items.slice(middle)].filter(column => column.length > 0) : [items];

  return <div className={cn("service-accordion grid items-start gap-6", columns.length > 1 && "lg:grid-cols-2")}>
    {columns.map((column, index) => <BouncyAccordion key={index} className="service-accordion-column"
      items={column} value={active} onValueChange={setActive} />)}
  </div>;
}
