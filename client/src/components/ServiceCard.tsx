import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Service } from "../lib/types";
import { ServiceIcon } from "./ServiceIcon";
import { useI18n } from "../i18n/I18nContext";

export function ServiceCard({ service }: { service: Service }) {
  const { t, pick, formatMoney } = useI18n();

  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="card card-hover group border border-base-300 bg-base-100 p-5"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-content">
        <ServiceIcon name={service.icon} />
      </span>
      <h3 className="mt-4 text-base font-bold leading-snug">{pick(service.nameEn, service.nameDe)}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-base-content/70">
        {pick(service.descriptionEn, service.descriptionDe)}
      </p>
      <div className="mt-auto flex items-center justify-between pt-4 text-xs">
        <span className="text-base-content/65">
          {service.startingPrice ? `${t("services.startingAt")} ${formatMoney(service.startingPrice)}` : ""}
        </span>
        <span className="flex items-center gap-1 font-semibold text-primary">
          {t("common.details")} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
