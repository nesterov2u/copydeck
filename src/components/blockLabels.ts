import type { TextBlock } from "../types";

export const typeLabels: Record<TextBlock["type"], string> = {
  header: "H",
  subhead: "S",
  paragraph: "P",
  caption: "C",
  list: "L",
  table: "T"
};
