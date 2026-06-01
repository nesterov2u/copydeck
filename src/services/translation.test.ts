import { describe, expect, it } from "vitest";
import { detectLanguage } from "./translation";

describe("detectLanguage", () => {
  it("detects Indonesian text without diacritics", () => {
    expect(
      detectLanguage(
        "Banyak sistem ERP yang terlihat terjangkau pada awalnya, namun kemudian memerlukan biaya tambahan."
      )
    ).toBe("ID");
  });

  it("detects Cyrillic Russian text", () => {
    expect(detectLanguage("Не выбирайте ERP только потому, что это дешево")).toBe("RU");
  });

  it("falls back to English for plain English text", () => {
    expect(detectLanguage("Choose an ERP because it fits your workflow")).toBe("EN");
  });
});
