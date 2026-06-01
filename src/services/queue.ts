import type { TextBlock } from "../types";

export function getNextBlockId(blocks: TextBlock[], currentId: string | null) {
  if (!blocks.length) return null;

  const currentIndex = normalizedCurrentIndex(blocks, currentId);
  return blocks[currentIndex + 1]?.id ?? blocks[0]?.id ?? null;
}

export function getPreviousBlockId(blocks: TextBlock[], currentId: string | null) {
  if (!blocks.length) return null;

  const currentIndex = normalizedCurrentIndex(blocks, currentId);
  return blocks[currentIndex - 1]?.id ?? blocks[blocks.length - 1]?.id ?? null;
}

function normalizedCurrentIndex(blocks: TextBlock[], currentId: string | null) {
  const currentIndex = blocks.findIndex((block) => block.id === currentId);
  return currentIndex >= 0 ? currentIndex : 0;
}
