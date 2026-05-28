import type { FilterMode, TextBlock } from "../types";

export const filterLabels: Record<FilterMode, string> = {
  all: "Все блоки",
  pending: "Ожидают",
  completed: "Готово",
  skipped: "Пропущено"
};

export const typeLabels: Record<TextBlock["type"], string> = {
  heading: "H1",
  paragraph: "P",
  quote: "QUOTE",
  caption: "CAP",
  cta: "CTA",
  list: "LIST",
  table: "TABLE",
  unknown: "TXT"
};
