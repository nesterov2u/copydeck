export type BlockType =
  | "heading"
  | "paragraph"
  | "quote"
  | "caption"
  | "cta"
  | "list"
  | "table"
  | "unknown";

export type BlockStatus = "pending" | "completed" | "skipped";

export type ParseMode = "paragraph" | "line" | "delimiter" | "custom";

export type FilterMode = "all" | "pending" | "completed" | "skipped";

export type ThemeMode = "light" | "dark" | "system";

export type TextBlock = {
  id: string;
  text: string;
  type: BlockType;
  status: BlockStatus;
  translation?: string;
  detectedLanguage?: string;
  targetLanguage?: string;
  translationStatus?: "idle" | "loading" | "ready" | "error" | "unavailable";
};

export type ToastState = {
  message: string;
  tone: "success" | "info" | "error";
} | null;
