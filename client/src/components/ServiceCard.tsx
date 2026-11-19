import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Service } from "../lib/types";
import { ServiceIcon } from "./ServiceIcon";
import { useI18n } from "../i18n/I18nContext";
import type { ComponentProps } from "react";

type ServiceCardProps = { service: Service; asButton?: boolean } & ComponentProps<"button">;

export function ServiceCard({ service, asButton = false, className, ...buttonProps }: ServiceCardProps) {
  const { t, pick, formatMoney } = useI18n();
  const cardClassName = cn("flex flex-col rounded-box card-hover group border border-base-300 bg-base-100 p-6 text-left", className);
  const Title = asButton ? "span" : "h3";
  const Description = asButton ? "span" : "p";

  const content = <>
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-sky text-ink transition group-hover:bg-primary group-hover:text-primary-content">
        <ServiceIcon name={service.icon} />
      </span>
      <Title className="mt-4 block text-base font-bold leading-snug">
        {pick(service.nameEn, service.nameDe)}
      </Title>
      <Description className="mt-2 line-clamp-3 text-sm leading-relaxed text-base-content/70">
        {pick(service.descriptionEn, service.descriptionDe)}
      </Description>
      <span className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4 text-xs">
        <span className="text-base-content/65">
          {service.startingPrice
            ? `${t("services.startingAt")} ${formatMoney(service.startingPrice)}`
            : ""}
        </span>
        <span className="flex items-center gap-1 font-semibold text-primary">
          {t("common.details")} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </span>
  </>;

  if (asButton) return <button type="button" aria-label={pick(service.nameEn, service.nameDe)} className={cardClassName} {...buttonProps}>{content}</button>;
  return <Link to="/services/$slug" params={{ slug: service.slug }} className={cardClassName}>{content}</Link>;
}
