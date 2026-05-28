import { describe, expect, it } from "vitest";
import type { TextBlock } from "../types";
import { getNextBlockId, getPreviousBlockId } from "./queue";

const blocks: TextBlock[] = [
  block("one", "completed"),
  block("two", "pending"),
  block("three", "completed"),
  block("four", "pending")
];

describe("queue navigation", () => {
  it("moves to the next pending block after current", () => {
    expect(getNextBlockId(blocks, "one")).toBe("two");
    expect(getNextBlockId(blocks, "two")).toBe("four");
  });

  it("falls back to the next block when there is no later pending block", () => {
    expect(getNextBlockId(blocks, "four")).toBe("one");
  });

  it("uses the first block when current id is missing", () => {
    expect(getNextBlockId(blocks, "missing")).toBe("two");
  });

  it("returns null for empty queues", () => {
    expect(getNextBlockId([], null)).toBeNull();
    expect(getPreviousBlockId([], null)).toBeNull();
  });

  it("moves to the previous block and wraps at the beginning", () => {
    expect(getPreviousBlockId(blocks, "three")).toBe("two");
    expect(getPreviousBlockId(blocks, "one")).toBe("four");
  });
});

function block(id: string, status: TextBlock["status"]): TextBlock {
  return {
    id,
    status,
    text: id,
    type: "paragraph",
    translationStatus: "idle"
  };
}
