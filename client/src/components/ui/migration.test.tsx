import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";
import { Input } from "./input";
import { NativeSelect } from "./native-select";
import { Textarea } from "./textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "./tabs";

describe("migrated native form controls", () => {
  it("preserves native validation, field values, submit and disabled semantics", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(new FormData(event.currentTarget));
        }}
      >
        <label>
          Email
          <Input name="email" type="email" required />
        </label>
        <label>
          Service
          <NativeSelect name="service" defaultValue="network">
            <option value="network">Network</option>
            <option value="support">Support</option>
          </NativeSelect>
        </label>
        <label>
          Details
          <Textarea name="details" required />
        </label>
        <Button>Send</Button>
        <Button type="button" disabled>
          Disabled
        </Button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(submit).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Email"), "team@example.com");
    await user.type(screen.getByLabelText("Details"), "Network help");
    await user.selectOptions(screen.getByLabelText("Service"), "support");
    await user.click(screen.getByRole("button", { name: "Send" }));
    const data = submit.mock.calls[0][0] as FormData;
    expect(Object.fromEntries(data.entries())).toEqual({
      email: "team@example.com",
      service: "support",
      details: "Network help",
    });
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });
  it("preserves asChild link semantics", () => {
    render(
      <Button asChild>
        <a href="/quote">Quote</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Quote" })).toHaveAttribute(
      "href",
      "/quote",
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});

it("dismisses the account menu with Escape and returns keyboard focus", async () => {
  const user = userEvent.setup();
  render(
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await user.tab();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("menuitem", { name: "Profile" })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("menu")).toBeNull();
  expect(screen.getByRole("button", { name: "Account" })).toHaveFocus();
});

it("switches controlled catalog tabs with arrow keys", async () => {
  const user = userEvent.setup();
  function Example() {
    const [value, setValue] = useState("services");
    return (
      <Tabs value={value} onValueChange={setValue}>
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }
  render(<Example />);
  screen.getByRole("tab", { name: "Services" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: "Products" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
