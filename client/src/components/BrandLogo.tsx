import { useI18n } from "../i18n/I18nContext";

export function BrandLogo() {
  const { t } = useI18n();

  return (
    <span className="brand-lockup">
      <svg className="brand-symbol" viewBox="0 0 54 54" fill="currentColor" aria-hidden="true">
        <rect x="19" width="16" height="16" rx="2" />
        <rect y="19" width="16" height="16" rx="2" />
        <rect x="38" y="19" width="16" height="16" rx="2" />
        <rect x="19" y="38" width="16" height="16" rx="2" />
      </svg>
      <span className="brand-wordmark">{t("brand.name")}</span>
    </span>
  );
}
