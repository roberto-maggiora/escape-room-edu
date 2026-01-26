import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import RoomExperience from "@/components/RoomExperience";
import { generateRoom } from "@/lib/generator";
import { RoomConfig } from "@/types";

vi.mock("@/components/LanguageToggle", () => ({
  default: () => null,
}));

vi.mock("@/components/Timer", () => ({
  default: () => null,
}));

vi.mock("@/lib/generator", () => ({
  generateRoom: vi.fn(),
}));

const config: RoomConfig = {
  title: "Test Room",
  subject: "Test",
  className: "1A",
  difficulty: "media",
  puzzleCount: 2,
};

const baseCopy = {
  missionTitle: "Missione",
  missionText: "Test",
  timerLabel: "Tempo",
  completionTitle: "Complimenti!",
  completionSubtitle: "Test",
  completionTimeLabel: "Tempo",
  completionPrintLabel: "Esporta PDF",
  completionNewGameLabel: "Nuova partita",
};

const renderRoom = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <RoomExperience
        config={config}
        locale="it"
        queryString=""
        {...baseCopy}
      />
    );
  });
  return { container, root };
};

const setNativeValue = (element: HTMLInputElement, value: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;
  valueSetter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
};

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

describe("RoomExperience gameplay", () => {
  it("locks puzzle 2 before puzzle 1 is solved", () => {
    vi.mocked(generateRoom).mockReturnValue([
      {
        id: "p1",
        type: "quiz",
        question: "Domanda 1",
        answer: "A",
        options: ["A", "B"],
      },
      {
        id: "p2",
        type: "keyword",
        question: "Domanda 2",
        answer: "B",
      },
    ]);
    const { container, root } = renderRoom();

    expect(container.textContent).toContain("Domanda 1");
    expect(container.textContent).not.toContain("Domanda 2");
    expect(container.querySelectorAll("input")).toHaveLength(1);
    expect(container.textContent).toContain("🔒");

    act(() => {
      root.unmount();
    });
  });

  it("validates answers as correct/incorrect", () => {
    vi.mocked(generateRoom).mockReturnValue([
      {
        id: "p1",
        type: "keyword",
        question: "Domanda",
        answer: "Roma",
      },
      {
        id: "p2",
        type: "riddle",
        question: "Seconda domanda",
        answer: "Risposta",
      },
    ]);
    const { container, root } = renderRoom();

    const input = container.querySelector("input") as HTMLInputElement;
    act(() => {
      setNativeValue(input, "roma");
    });
    const checkButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Verifica")
    ) as HTMLButtonElement;
    act(() => {
      checkButton.click();
    });

    expect(container.textContent).toContain("Corretto!");

    act(() => {
      root.unmount();
    });
  });

  it("calls window.print from export button", () => {
    vi.mocked(generateRoom).mockReturnValue([
      {
        id: "p1",
        type: "keyword",
        question: "Domanda",
        answer: "Roma",
      },
    ]);
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    const { container, root } = renderRoom();

    const printButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Esporta PDF")
    ) as HTMLButtonElement;
    act(() => {
      printButton.click();
    });

    expect(printSpy).toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
    printSpy.mockRestore();
  });
});
