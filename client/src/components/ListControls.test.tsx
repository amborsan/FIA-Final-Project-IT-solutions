import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it } from "vitest";
import { I18nProvider } from "../i18n/I18nContext";
import { Pagination } from "./ListControls";
import { paginate, useListControls } from "../lib/list";

function ListFixture() {
  const controls = useListControls();
  const data = paginate(Array.from({ length: 200 }, (_, index) => index + 1), controls.page, controls.pageSize);
  return <Pagination {...data} pageSize={controls.pageSize} onPageChange={controls.setPage} onPageSizeChange={controls.setPageSize} />;
}

it("changes pages and page size using the existing list state", async () => {
  render(<I18nProvider><ListFixture /></I18nProvider>);
  const user = userEvent.setup();
  const nav = screen.getByRole("navigation", { name: "Pagination" });
  expect(within(nav).getByRole("button", { name: "Previous page" })).toBeDisabled();
  await user.click(within(nav).getByRole("button", { name: "Next page" }));
  expect(screen.getByText("Showing 11–20 of 200")).toBeVisible();
  await user.click(within(nav).getByRole("button", { name: "Forward 5 pages" }));
  expect(screen.getByText("Showing 61–70 of 200")).toBeVisible();
  await user.selectOptions(screen.getByRole("combobox", { name: "Rows" }), "25");
  expect(screen.getByText("Showing 1–25 of 200")).toBeVisible();
  expect(within(nav).getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
});

it("does not render empty-list pagination", () => {
  const { container } = render(<I18nProvider><Pagination page={1} totalPages={1} total={0} from={0} to={0} pageSize={10} onPageChange={() => {}} onPageSizeChange={() => {}} /></I18nProvider>);
  expect(container).toBeEmptyDOMElement();
});

function IndependentPagers() {
  const [first, setFirst] = useState(1);
  const [second, setSecond] = useState(1);
  return <>
    <Pagination page={first} totalPages={10} total={100} from={1} to={10} pageSize={10} onPageChange={setFirst} onPageSizeChange={() => {}} />
    <Pagination page={second} totalPages={10} total={100} from={1} to={10} pageSize={10} onPageChange={setSecond} onPageSizeChange={() => {}} />
  </>;
}

it("keeps multiple pagers on the same page independent", async () => {
  render(<I18nProvider><IndependentPagers /></I18nProvider>);
  const user = userEvent.setup();
  const [first, second] = screen.getAllByRole("navigation", { name: "Pagination" });
  await user.click(within(first).getByRole("button", { name: "Next page" }));
  expect(within(first).getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  expect(within(second).getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
});
