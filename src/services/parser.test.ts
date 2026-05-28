import { describe, expect, it } from "vitest";
import { inferBlockType, parseTextToBlocks } from "./parser";

describe("parseTextToBlocks", () => {
  it("splits text into paragraph blocks by empty lines", () => {
    const blocks = parseTextToBlocks("Heading\n\nFirst paragraph.\n\nSecond paragraph.", "paragraph");

    expect(blocks).toHaveLength(3);
    expect(blocks.map((block) => block.text)).toEqual([
      "Heading",
      "First paragraph.",
      "Second paragraph."
    ]);
    expect(blocks.every((block) => block.status === "pending")).toBe(true);
  });

  it("splits every non-empty line in line mode", () => {
    const blocks = parseTextToBlocks("One\n\nTwo\n  \nThree", "line");

    expect(blocks.map((block) => block.text)).toEqual(["One", "Two", "Three"]);
  });

  it("splits common delimiter lines in delimiter mode", () => {
    const blocks = parseTextToBlocks("One\n---\nTwo\n===\nThree\n###\nFour", "delimiter");

    expect(blocks.map((block) => block.text)).toEqual(["One", "Two", "Three", "Four"]);
  });

  it("uses custom separator when provided", () => {
    const blocks = parseTextToBlocks("One///Two///Three", "custom", "///");

    expect(blocks.map((block) => block.text)).toEqual(["One", "Two", "Three"]);
  });

  it("falls back to paragraph mode when custom separator is empty", () => {
    const blocks = parseTextToBlocks("One\n\nTwo", "custom", "");

    expect(blocks.map((block) => block.text)).toEqual(["One", "Two"]);
  });

  it("returns an empty list for whitespace-only input", () => {
    expect(parseTextToBlocks(" \n\n ", "paragraph")).toEqual([]);
  });
});

describe("inferBlockType", () => {
  it("detects common block types", () => {
    expect(inferBlockType("CTA: Buy now", 2)).toBe("cta");
    expect(inferBlockType("Caption: Product photo", 2)).toBe("caption");
    expect(inferBlockType("- First item", 2)).toBe("list");
    expect(inferBlockType("Name\tValue", 2)).toBe("table");
    expect(inferBlockType("Short heading", 2)).toBe("heading");
    expect(inferBlockType("This is a complete paragraph with punctuation.", 2)).toBe("paragraph");
  });
});
