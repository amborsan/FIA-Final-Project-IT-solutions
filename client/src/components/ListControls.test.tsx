import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ArchiveTabs } from "./ListControls";
import { I18nProvider } from "../i18n/I18nContext";
import type { ArchiveMode } from "../lib/list";

it.each(["en", "de"])(
  "keeps archive filtering keyboard-operable in %s",
  async (language) => {
    localStorage.setItem("orbit_language", language);
    function Example() {
      const [value, setValue] = useState<ArchiveMode>("active");
      return <ArchiveTabs value={value} onChange={setValue} />;
    }
    render(
      <I18nProvider>
        <Example />
      </I18nProvider>,
    );
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
  },
);
