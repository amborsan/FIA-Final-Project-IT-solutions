import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { I18nProvider } from "../i18n/I18nContext";
import { HomeSectionState } from "./HomeSectionState";

const defaults = {
  isPending: false, isFetching: false, isError: false, hasItems: false,
  loadingLabel: "Loading services…", errorLabel: "Services could not be loaded.",
  emptyTitle: "No services are available yet.", onRetry: vi.fn(),
};
const content = <p>Existing service content</p>;

it("distinguishes loading from a successful empty result", () => {
  const { rerender } = render(<I18nProvider><HomeSectionState {...defaults} isPending isFetching>{content}</HomeSectionState></I18nProvider>);
  expect(screen.getByRole("status")).toHaveTextContent(defaults.loadingLabel);
  expect(screen.queryByText(defaults.emptyTitle)).not.toBeInTheDocument();
  expect(screen.queryByText("Existing service content")).not.toBeInTheDocument();
  rerender(<I18nProvider><HomeSectionState {...defaults}>{content}</HomeSectionState></I18nProvider>);
  expect(screen.getByText(defaults.emptyTitle)).toBeVisible();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("reports errors and retries without describing a failure as empty data", async () => {
  const retry = vi.fn();
  render(<I18nProvider><HomeSectionState {...defaults} isError onRetry={retry}>{content}</HomeSectionState></I18nProvider>);
  expect(screen.getByRole("alert")).toHaveTextContent(defaults.errorLabel);
  expect(screen.queryByText(defaults.emptyTitle)).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
});

it("keeps cached content visible after an update error and prevents duplicate retries", () => {
  render(<I18nProvider><HomeSectionState {...defaults} hasItems isError isFetching>{content}</HomeSectionState></I18nProvider>);
  expect(screen.getByText("Existing service content")).toBeVisible();
  expect(screen.getByRole("alert")).toHaveTextContent(defaults.errorLabel);
  expect(screen.getByRole("button")).toBeDisabled();
});

it("shows refreshing feedback without replacing cached content", () => {
  render(<I18nProvider><HomeSectionState {...defaults} hasItems isFetching>{content}</HomeSectionState></I18nProvider>);
  expect(screen.getByRole("status")).toHaveTextContent(defaults.loadingLabel);
  expect(screen.getByText("Existing service content")).toBeVisible();
});
