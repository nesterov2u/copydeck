import type { TextBlock } from "../types";

export function blockPosition(blocks: TextBlock[], block: TextBlock) {
  return `${blocks.findIndex((item) => item.id === block.id) + 1} / ${blocks.length}`;
}

export function firstLine(text: string) {
  return text.split("\n")[0] ?? text;
}

export function secondLine(text: string) {
  const lines = text.split("\n");
  return lines.slice(1).join(" ") || text;
}
