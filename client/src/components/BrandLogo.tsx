import { useI18n } from "../i18n/I18nContext";

export function BrandLogo() {
  const { t } = useI18n();

  return (
    <span className="brand-lockup">
      <span className="brand-symbol" aria-hidden="true" />
      <span className="brand-wordmark">{t("brand.name")}</span>
    </span>
  );
}
