import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";
it("keeps the existing theme names, persistence and toggle behaviour", async () => {
  localStorage.setItem("orbit_theme", "dark");
  function Toggle() {
    const { theme, toggleTheme } = useTheme();
    return <button onClick={toggleTheme}>{theme}</button>;
  }
  render(
    <ThemeProvider>
      <Toggle />
    </ThemeProvider>,
  );
  expect(document.documentElement).toHaveAttribute("data-theme", "orbit-dark");
  await userEvent.click(screen.getByRole("button", { name: "dark" }));
  expect(document.documentElement).toHaveAttribute("data-theme", "orbit");
  expect(localStorage.getItem("orbit_theme")).toBe("light");
});
