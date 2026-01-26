import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import Timer from "@/components/Timer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const renderTimer = (
  isRunning: boolean,
  onTick: (value: number | ((v: number) => number)) => void
) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <Timer label="Tempo" seconds={0} isRunning={isRunning} onTick={onTick} />
    );
  });
  return { container, root };
};

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("Timer", () => {
  it("ticks every second when running", async () => {
    vi.useFakeTimers();
    const onTick = vi.fn();
    const { root } = renderTimer(true, onTick);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(onTick).toHaveBeenCalledTimes(3);

    act(() => {
      root.unmount();
    });
  });
});
