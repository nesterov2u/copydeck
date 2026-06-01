import { nanoid } from "nanoid";
import type { BlockType, ParseMode, TextBlock } from "../types";

const delimiterPattern = /^\s*(?:---|===|###)\s*$/gm;

export function parseTextToBlocks(
  source: string,
  mode: ParseMode,
  customSeparator = ""
): TextBlock[] {
  const normalized = source.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks = splitText(normalized, mode, customSeparator)
    .map((item) => item.trim())
    .filter(Boolean);

  return chunks.map((text, index) => ({
    id: nanoid(),
    text,
    type: inferBlockType(text, index),
    status: "pending",
    translationStatus: "idle"
  }));
}

function splitText(text: string, mode: ParseMode, customSeparator: string) {
  if (mode === "line") return text.split("\n").filter((line) => line.trim());
  if (mode === "delimiter") return text.split(delimiterPattern);
  if (mode === "custom" && customSeparator.trim()) return text.split(customSeparator);
  return text.split(/\n\s*\n+/);
}

export function inferBlockType(text: string, index: number): BlockType {
  const firstLine = text.split("\n")[0]?.trim() ?? "";
  const lower = firstLine.toLowerCase();

  if (text.includes("\t")) return "table";
  if (/^(table|таблица):/i.test(lower)) return "table";
  if (/^(caption|fig\.|image):/i.test(lower)) return "caption";
  if (/^([-*•]|\d+\.)\s+/.test(firstLine)) return "list";
  if (/^(subhead|subtitle|подзаголовок):/i.test(lower)) return "subhead";
  if (index === 0 && firstLine.length < 90) return "header";
  if (firstLine.length < 70 && !/[.!?]$/.test(firstLine)) return "header";

  return "paragraph";
}
