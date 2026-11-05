import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translations, type Language, type TranslationKey } from "./translations";

type I18nValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Pick the English or German value from an API object. */
  pick: (en: string | null | undefined, de: string | null | undefined) => string;
  formatDate: (value: string | Date | null | undefined) => string;
  formatDateTime: (value: string | Date | null | undefined) => string;
  formatMoney: (value: string | number | null | undefined) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = "orbit_language";

function readLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "de" ? "de" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nValue>(() => {
    const dictionary = translations[language];

    const t = (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text: string = dictionary[key] ?? translations.en[key] ?? key;
      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          text = text.replaceAll(`{{${name}}}`, String(replacement));
        }
      }
      return text;
    };

    const locale = language === "de" ? "de-DE" : "en-GB";

    const formatDate = (raw: string | Date | null | undefined) => {
      if (!raw) return "–";
      return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(raw));
    };

    const formatDateTime = (raw: string | Date | null | undefined) => {
      if (!raw) return "–";
      return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(raw));
    };

    const formatMoney = (raw: string | number | null | undefined) => {
      const number = Number(raw ?? 0);
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
      }).format(Number.isFinite(number) ? number : 0);
    };

    const pick = (en: string | null | undefined, de: string | null | undefined) =>
      (language === "de" ? de || en : en || de) || "";

    return {
      language,
      setLanguage,
      t,
      pick,
      formatDate,
      formatDateTime,
      formatMoney,
    };
  }, [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
