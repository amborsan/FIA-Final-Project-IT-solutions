import { ToastProvider } from "../context/ToastContext";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { useState } from "react";
import { I18nProvider } from "../i18n/I18nContext";
import { ApiError } from "../lib/api";
import { StatusSelect, StatusUpdateFeedback, useStatusUpdate } from "./StatusControl";

function Harness({ action, removeOnSuccess = false }: { action: (id: string, value: string) => Promise<void>; removeOnSuccess?: boolean }) {
  const [value, setValue] = useState("NEW");
  const { update, pendingId, feedback } = useStatusUpdate(async (id, next) => {
    await action(id, next);
    setValue(next);
  });
  return <>
    <StatusUpdateFeedback feedback={feedback} />
    {!(removeOnSuccess && value === "COMPLETED") && <StatusSelect
      value={value} options={["NEW", "COMPLETED"]} reference="SR-1"
      pending={pendingId === "id-1"} disabled={!!pendingId}
      onChange={status => void update("id-1", "SR-1", status)}
    />}
  </>;
}

it("keeps the current value while saving, blocks duplicates and announces success even if the row disappears", async () => {
  let finish: () => void = () => {};
  const action = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  render(<I18nProvider><ToastProvider><Harness action={action} removeOnSuccess /></ToastProvider></I18nProvider>);
  const select = screen.getByRole("combobox", { name: "Status for SR-1" });
  expect(select).toHaveValue("NEW");
  await userEvent.selectOptions(select, "COMPLETED");
  expect(select).toBeDisabled();
  expect(select).toHaveValue("NEW");
  expect(screen.getByRole("status")).toHaveTextContent("Updating status for SR-1");
  await userEvent.selectOptions(select, "COMPLETED");
  expect(action).toHaveBeenCalledTimes(1);
  expect(action).toHaveBeenCalledWith("id-1", "COMPLETED");
  await act(async () => finish());
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Status updated for SR-1");
});

it("preserves the confirmed value and exposes a permission error without reporting success", async () => {
  const action = vi.fn().mockRejectedValueOnce(new ApiError(403, "Forbidden")).mockResolvedValueOnce(undefined);
  render(<I18nProvider><ToastProvider><Harness action={action} /></ToastProvider></I18nProvider>);
  const select = screen.getByRole("combobox");
  await userEvent.selectOptions(select, "COMPLETED");
  expect(await screen.findByRole("alert")).toHaveTextContent("Forbidden");
  expect(select).toHaveValue("NEW");
  expect(select).toBeEnabled();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(action).toHaveBeenCalledTimes(1);
  await userEvent.selectOptions(select, "COMPLETED");
  expect(select).toHaveValue("COMPLETED");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Status updated for SR-1");
});
