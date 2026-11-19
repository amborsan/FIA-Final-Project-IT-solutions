import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useAnimatedToastStack } from "./AnimatedToastStack";

afterEach(() => vi.useRealTimers());

it("preserves remaining time while paused and keeps persistent errors until dismissed", () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useAnimatedToastStack({ defaultDuration: 6000 }));
  act(() => {
    result.current.showToast({ id: "saved", title: "Saved", status: "success" });
    result.current.showToast({ id: "error", title: "Retry", status: "error", duration: 0 });
  });
  act(() => vi.advanceTimersByTime(2000));
  act(() => result.current.pauseToasts());
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.toasts).toHaveLength(2);
  act(() => result.current.resumeToasts());
  act(() => vi.advanceTimersByTime(3999));
  expect(result.current.toasts).toHaveLength(2);
  act(() => vi.advanceTimersByTime(1));
  expect(result.current.toasts.map(item => item.id)).toEqual(["error"]);
  act(() => result.current.dismissToast("error"));
  expect(result.current.toasts).toHaveLength(0);
});

it("morphs the same notification, restarts its duration and caps a burst at four", () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useAnimatedToastStack({ limit: 4 }));
  act(() => result.current.showToast({ id: "save", title: "Saving", status: "loading", duration: 0 }));
  act(() => vi.advanceTimersByTime(10000));
  act(() => result.current.showToast({ id: "save", title: "Saved", status: "success", duration: 1000 }));
  expect(result.current.toasts).toHaveLength(1);
  expect(result.current.toasts[0].status).toBe("success");
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.toasts).toHaveLength(0);
  act(() => { for (let i = 0; i < 6; i++) result.current.showToast({ id: String(i), title: String(i) }); });
  expect(result.current.toasts.map(item => item.id)).toEqual(["2", "3", "4", "5"]);
});
