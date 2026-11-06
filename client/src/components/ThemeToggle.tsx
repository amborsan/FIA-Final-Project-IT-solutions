import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useI18n } from "../i18n/I18nContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === "dark";
  const label = isDark ? t("theme.switchToLight") : t("theme.switchToDark");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-ghost btn-sm ${className}`}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
