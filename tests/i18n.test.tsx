import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import RoomClient from "@/components/RoomClient";
import { defaultLocale, getLocale, t } from "@/lib/i18n";

vi.mock("@/components/LanguageToggle", () => ({
  default: () => null,
}));

describe("i18n getLocale", () => {
  it("defaults to it", () => {
    const params = new URLSearchParams();
    expect(getLocale(params)).toBe(defaultLocale);
  });

  it("accepts lang=en", () => {
    const params = new URLSearchParams("lang=en");
    expect(getLocale(params)).toBe("en");
  });

  it("falls back on invalid lang", () => {
    const params = new URLSearchParams("lang=xxx");
    expect(getLocale(params)).toBe(defaultLocale);
  });
});

describe("i18n t()", () => {
  it("interpolates progress values", () => {
    expect(t("it", "room.progress", { done: 2, total: 5 })).toBe("2/5 completati");
  });
});

describe("room UI (EN)", () => {
  it("renders Print PDF button in English", () => {
    const html = renderToStaticMarkup(
      <RoomClient
        locale="en"
        queryString="lang=en"
        config={{
          title: "Test Room",
          subject: "Science",
          className: "3A",
          difficulty: "media",
          puzzleCount: 3,
        }}
      />
    );
    expect(html).toContain("Print PDF");
    expect(html).not.toContain("Esporta PDF");
  });
});
