import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "../context/ThemeContext";
import { useI18n } from "../i18n/I18nContext";
import "./beui/ThemeToggle.css";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const transitionRef = useRef<ViewTransition | null>(null);
  const { t } = useI18n();
  const isDark = theme === "dark";
  const label = isDark ? t("theme.switchToLight") : t("theme.switchToDark");

  useEffect(() => () => { transitionRef.current?.skipTransition(); }, []);

  function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
    // Let one reveal finish before accepting another pointer press.
    if (transitionRef.current) return;
    const next = isDark ? "light" : "dark";
    const update = () => { flushSync(() => setTheme(next)); };
    if (event.detail === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof document.startViewTransition !== "function") {
      update();
      return;
    }

    // Be UI Circle Blur, adapted to our existing provider and token palette.
    const root = document.documentElement;
    root.dataset.beuiVt = "circle-blur";
    try {
      const transition = document.startViewTransition(update);
      transitionRef.current = transition;
      const cleanup = () => {
        if (transitionRef.current !== transition) return;
        transitionRef.current = null;
        delete root.dataset.beuiVt;
      };
      // A hidden tab or skipped snapshot may reject ready; theme still applies.
      void transition.ready.catch(() => {});
      void transition.finished.then(cleanup, cleanup);
    } catch {
      delete root.dataset.beuiVt;
      update();
    }
  }

  return (
    <Button
      type="button"
      onClick={toggleTheme}
      className={cn("border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm", className)}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
