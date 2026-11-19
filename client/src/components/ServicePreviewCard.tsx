import { Dialog } from "radix-ui";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import type { Service } from "../lib/types";
import { buttonVariants } from "./ui/button";
import { cn } from "../lib/utils";
import { CenterMorphModal } from "./beui/CenterMorphModal";
import { ServiceCard } from "./ServiceCard";

export function ServicePreviewCard({ service }: { service: Service }) {
  const { t, pick, formatMoney } = useI18n();
  return (
    <CenterMorphModal trigger={<ServiceCard service={service} asButton />} title={pick(service.nameEn, service.nameDe)} description={pick(service.descriptionEn, service.descriptionDe)}>
      {service.startingPrice && <p className="mt-5 text-lg font-medium">{t("services.startingAt")} {formatMoney(service.startingPrice)}</p>}
      <div className="mt-6 border-y border-hairline py-5">
        <h3 className="text-base font-medium">{t("services.included")}</h3>
        <ul className="mt-4 space-y-3 text-sm text-ink-soft">
          {[1, 2, 3, 4].map(number => <li key={number} className="flex items-start gap-2.5">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
            {t(`services.scope${number}` as "services.scope1")}
          </li>)}
        </ul>
      </div>
      <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted"><Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{t("quote.responseTime")}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Dialog.Close asChild>
          <Link to="/quote" search={{ service: service.id }} className={buttonVariants()}>{t("nav.quote")}<ArrowRight aria-hidden="true" className="size-4" /></Link>
        </Dialog.Close>
        <Dialog.Close asChild>
          <Link to="/services/$slug" params={{ slug: service.slug }} className={cn(buttonVariants({ variant: "outline" }))}>{t("services.viewFullDetails")}<ArrowRight aria-hidden="true" className="size-4" /></Link>
        </Dialog.Close>
      </div>
    </CenterMorphModal>
  );
}
