export type BlockType =
  | "header"
  | "subhead"
  | "paragraph"
  | "caption"
  | "list"
  | "table";

export type BlockStatus = "pending" | "completed" | "skipped";

export type ParseMode = "paragraph" | "line" | "delimiter" | "custom";

export type ThemeMode = "light" | "dark" | "system";

export type InterfaceLanguage = "en" | "ru";

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

export type RecentImport = {
  id: string;
  createdAt: number;
  blockCount: number;
  preview: string;
  blocks: TextBlock[];
};

export type ToastState = {
  message: string;
  tone: "success" | "info" | "error";
} | null;

export type UpdateStatus = "idle" | "checking" | "available" | "updating";

export type AppUpdateInfo = {
  version: string;
  currentVersion: string;
  date?: string;
  body?: string;
};
