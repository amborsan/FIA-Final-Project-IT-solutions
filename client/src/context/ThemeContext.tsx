import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// "light" is the default Orbit theme, "dark" is the matching night palette.
export type Theme = "light" | "dark";

type ThemeValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

const STORAGE_KEY = "orbit_theme";

function readTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  // No choice yet: follow the operating system.
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  // Keep the <html> attribute in sync with the shared token palette.
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme === "dark" ? "orbit-dark" : "orbit",
    );
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    const canvas = getComputedStyle(document.documentElement)
      .getPropertyValue("--canvas")
      .trim();
    if (canvas) meta?.setAttribute("content", canvas);
  }, [theme]);

  const value = useMemo<ThemeValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
