import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { HeaderDrawer } from "./HeaderDrawer";

function Fixture() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button>Outside</button>
      <HeaderDrawer open={open} onOpenChange={setOpen} id="test-menu" title="Navigation" closeLabel="Close navigation" trigger={<button>Open navigation</button>}>
        <a href="/services" onClick={() => setOpen(false)}>Services</a>
      </HeaderDrawer>
    </>
  );
}

test("moves focus into the drawer, traps Tab, and restores focus after Escape", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const trigger = screen.getByRole("button", { name: "Open navigation" });
  await user.click(trigger);
  expect(await screen.findByRole("dialog", { name: "Navigation" })).toHaveAttribute("id", "test-menu");
  expect(trigger).toHaveAttribute("aria-controls", "test-menu");
  const close = screen.getByRole("button", { name: "Close navigation" });
  await waitFor(() => expect(close).toHaveFocus());
  await user.tab({ shift: true });
  expect(screen.getByRole("link", { name: "Services" })).toHaveFocus();
  await user.tab();
  expect(close).toHaveFocus();
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

test("the close button dismisses the drawer and releases the scroll lock", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  await user.click(screen.getByRole("button", { name: "Open navigation" }));
  await screen.findByRole("dialog");
  expect(document.body).toHaveAttribute("data-scroll-locked");
  await user.click(screen.getByRole("button", { name: "Close navigation" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(document.body).not.toHaveAttribute("data-scroll-locked");
});
