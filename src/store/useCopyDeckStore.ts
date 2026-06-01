import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BlockType,
  ParseMode,
  SpreadsheetImportMode,
  TextBlock,
  ThemeMode,
  ToastState,
  AppUpdateInfo,
  UpdateStatus
} from "../types";
import { parseTextToBlocks } from "../services/parser";
import { readClipboard, writeClipboard } from "../services/clipboard";
import { getNextBlockId, getPreviousBlockId } from "../services/queue";
import { detectLanguage, translateText } from "../services/translation";
import {
  checkForAppUpdate,
  installPendingAppUpdate
} from "../services/updater";

type CopyDeckState = {
  blocks: TextBlock[];
  currentId: string | null;
  parseMode: ParseMode;
  customSeparator: string;
  spreadsheetImportMode: SpreadsheetImportMode;
  selectedColumnIndex: number;
  translationEnabled: boolean;
  targetLanguage: string;
  theme: ThemeMode;
  view: "list" | "preview" | "settings";
  pinned: boolean;
  compactMode: boolean;
  toast: ToastState;
  updateStatus: UpdateStatus;
  availableUpdate: AppUpdateInfo | null;
  importText: (text: string) => void;
  importFromClipboard: () => Promise<void>;
  copyBlock: (id: string, advance?: boolean) => Promise<void>;
  copyCurrent: () => Promise<void>;
  copyAndNext: () => Promise<void>;
  setCurrent: (id: string) => void;
  openPreview: (id: string) => void;
  openSettings: () => void;
  backToList: () => void;
  setParseMode: (mode: ParseMode) => void;
  setCustomSeparator: (separator: string) => void;
  setSpreadsheetImportMode: (mode: SpreadsheetImportMode) => void;
  setSelectedColumnIndex: (index: number) => void;
  setTranslationEnabled: (enabled: boolean) => void;
  setTargetLanguage: (language: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setPinned: (pinned: boolean) => void;
  setCompactMode: (compactMode: boolean) => void;
  toggleCompleted: (id: string) => void;
  markSkipped: (id: string) => void;
  goNext: () => void;
  goPrevious: () => void;
  separateCurrent: () => void;
  translateBlock: (id: string) => Promise<void>;
  checkForUpdates: () => Promise<void>;
  installUpdate: () => Promise<void>;
  clearCache: () => void;
  clearToast: () => void;
};

type PersistedCopyDeckState = Pick<
  CopyDeckState,
  | "blocks"
  | "currentId"
  | "parseMode"
  | "customSeparator"
  | "spreadsheetImportMode"
  | "selectedColumnIndex"
  | "translationEnabled"
  | "targetLanguage"
  | "theme"
  | "pinned"
  | "compactMode"
>;

export const useCopyDeckStore = create<CopyDeckState>()(
  persist(
    (set, get) => ({
      blocks: sampleBlocks(),
      currentId: "sample-1",
      parseMode: "paragraph",
      customSeparator: "//",
      spreadsheetImportMode: "cell",
      selectedColumnIndex: 0,
      translationEnabled: true,
      targetLanguage: "RU",
      theme: "system",
      view: "list",
      pinned: false,
      compactMode: true,
      toast: null,
      updateStatus: "idle",
      availableUpdate: null,
      importText: (text) => {
        const blocks = parseTextToBlocks(text, get().parseMode, get().customSeparator).map(
          (block) => ({
            ...block,
            detectedLanguage: detectLanguage(block.text)
          })
        );
        set({
          blocks,
          currentId: blocks[0]?.id ?? null,
          view: "list",
          toast: { message: `Imported ${blocks.length} blocks`, tone: "success" }
        });
      },
      importFromClipboard: async () => {
        try {
          const text = await readClipboard();
          get().importText(text);
        } catch {
          set({ toast: { message: "Import failed", tone: "error" } });
        }
      },
      copyBlock: async (id, advance = false) => {
        const block = get().blocks.find((item) => item.id === id);
        if (!block) return;
        await writeClipboard(block.text);
        set((state) => ({
          blocks: state.blocks.map((item) =>
            item.id === id ? { ...item, status: "completed" } : item
          ),
          toast: { message: "Copied", tone: "success" }
        }));
        if (advance) {
          get().goNext();
        }
      },
      copyCurrent: async () => {
        const currentId = get().currentId;
        if (currentId) await get().copyBlock(currentId);
      },
      copyAndNext: async () => {
        const currentId = get().currentId;
        if (currentId) await get().copyBlock(currentId, true);
      },
      setCurrent: (id) => set({ currentId: id }),
      openPreview: (id) => set({ currentId: id, view: "preview" }),
      openSettings: () => set({ view: "settings" }),
      backToList: () => set({ view: "list" }),
      setParseMode: (parseMode) => set({ parseMode }),
      setCustomSeparator: (customSeparator) => set({ customSeparator }),
      setSpreadsheetImportMode: (spreadsheetImportMode) => set({ spreadsheetImportMode }),
      setSelectedColumnIndex: (selectedColumnIndex) =>
        set({ selectedColumnIndex: Math.max(0, Math.floor(selectedColumnIndex || 0)) }),
      setTranslationEnabled: (translationEnabled) => set({ translationEnabled }),
      setTargetLanguage: (targetLanguage) => set({ targetLanguage: targetLanguage.toUpperCase() }),
      setTheme: (theme) => set({ theme }),
      setPinned: (pinned) => set({ pinned }),
      setCompactMode: (compactMode) => set({ compactMode }),
      toggleCompleted: (id) =>
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id
              ? { ...block, status: block.status === "completed" ? "pending" : "completed" }
              : block
          )
        })),
      markSkipped: (id) =>
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id ? { ...block, status: "skipped" } : block
          )
        })),
      goNext: () => {
        const { blocks, currentId } = get();
        set({ currentId: getNextBlockId(blocks, currentId) });
      },
      goPrevious: () => {
        const { blocks, currentId } = get();
        set({ currentId: getPreviousBlockId(blocks, currentId) });
      },
      separateCurrent: () => {
        const { blocks, currentId, parseMode, customSeparator } = get();
        const currentIndex = blocks.findIndex((block) => block.id === currentId);
        const currentBlock = blocks[currentIndex];
        if (!currentBlock) return;

        const separated = parseTextToBlocks(currentBlock.text, parseMode, customSeparator);
        if (separated.length <= 1) {
          set({ toast: { message: "Block cannot be separated", tone: "info" } });
          return;
        }

        const nextBlocks = [
          ...blocks.slice(0, currentIndex),
          ...separated,
          ...blocks.slice(currentIndex + 1)
        ];

        set({
          blocks: nextBlocks,
          currentId: separated[0]?.id ?? currentId,
          toast: { message: `Separated into ${separated.length} blocks`, tone: "success" }
        });
      },
      translateBlock: async (id) => {
        if (!get().translationEnabled) {
          setBlock(id, { translationStatus: "unavailable" });
          return;
        }
        const block = get().blocks.find((item) => item.id === id);
        if (!block || block.translationStatus === "loading") return;
        if (block.translation) return;

        setBlock(id, { translationStatus: "loading", detectedLanguage: detectLanguage(block.text) });
        try {
          const translated = await translateText(block.text, get().targetLanguage);
          setBlock(id, {
            translation: translated.translatedText,
            detectedLanguage: translated.sourceLanguage,
            targetLanguage: translated.targetLanguage,
            translationStatus: "ready"
          });
        } catch {
          setBlock(id, { translationStatus: "error" });
          set({ toast: { message: "Translation unavailable", tone: "error" } });
        }
      },
      checkForUpdates: async () => {
        if (get().updateStatus === "checking" || get().updateStatus === "updating") return;

        set({ updateStatus: "checking", toast: { message: "Checking updates", tone: "info" } });
        try {
          const update = await checkForAppUpdate();
          set({
            updateStatus: update ? "available" : "idle",
            availableUpdate: update,
            toast: update
              ? { message: `Update ${update.version} available`, tone: "info" }
              : { message: "CopyDeck is up to date", tone: "success" }
          });
        } catch {
          set({
            updateStatus: "idle",
            availableUpdate: null,
            toast: { message: "No update available yet", tone: "info" }
          });
        }
      },
      installUpdate: async () => {
        if (get().updateStatus === "updating") return;

        set({ updateStatus: "updating", toast: { message: "Installing update", tone: "info" } });
        try {
          await installPendingAppUpdate();
        } catch {
          set({
            updateStatus: get().availableUpdate ? "available" : "idle",
            toast: { message: "Update install failed", tone: "error" }
          });
        }
      },
      clearCache: () =>
        set((state) => ({
          blocks: state.blocks.map((block) => ({
            ...block,
            translation: undefined,
            targetLanguage: undefined,
            translationStatus: "idle"
          })),
          toast: { message: "Cache cleared", tone: "success" }
        })),
      clearToast: () => set({ toast: null })
    }),
    {
      name: "copydeck-state",
      version: 3,
      migrate: (persisted) => {
        const state = persisted as Partial<PersistedCopyDeckState>;
        return {
          blocks: (state.blocks ?? sampleBlocks()).map((block) => ({
            ...block,
            type: normalizeBlockType(block.type)
          })),
          currentId: state.currentId ?? null,
          parseMode: state.parseMode ?? "paragraph",
          customSeparator: state.customSeparator || "//",
          spreadsheetImportMode: state.spreadsheetImportMode ?? "cell",
          selectedColumnIndex: state.selectedColumnIndex ?? 0,
          translationEnabled: state.translationEnabled ?? true,
          targetLanguage: state.targetLanguage ?? "RU",
          theme: state.theme ?? "system",
          pinned: state.pinned ?? false,
          compactMode: state.compactMode ?? true
        };
      },
      partialize: (state) => ({
        blocks: state.blocks,
        currentId: state.currentId,
        parseMode: state.parseMode,
        customSeparator: state.customSeparator,
        spreadsheetImportMode: state.spreadsheetImportMode,
        selectedColumnIndex: state.selectedColumnIndex,
        translationEnabled: state.translationEnabled,
        targetLanguage: state.targetLanguage,
        theme: state.theme,
        pinned: state.pinned,
        compactMode: state.compactMode
      })
    }
  )
);

function normalizeBlockType(type: string): BlockType {
  if (
    type === "header" ||
    type === "subhead" ||
    type === "caption" ||
    type === "table" ||
    type === "list" ||
    type === "paragraph"
  ) {
    return type;
  }

  if (type === "heading") return "header";
  if (type === "quote") return "caption";
  return "paragraph";
}

function setBlock(id: string, patch: Partial<TextBlock>) {
  useCopyDeckStore.setState((state) => ({
    blocks: state.blocks.map((block) => (block.id === id ? { ...block, ...patch } : block))
  }));
}

function sampleBlocks(): TextBlock[] {
  return [
    {
      id: "sample-1",
      text: "Premium coffee beans\nfrom Colombia",
      type: "header",
      status: "pending",
      detectedLanguage: "EN",
      translationStatus: "idle"
    },
    {
      id: "sample-2",
      text: "Free worldwide shipping\non all orders over $50.",
      type: "paragraph",
      status: "completed",
      detectedLanguage: "EN",
      translationStatus: "idle"
    },
    {
      id: "sample-3",
      text: "“The best coffee I’ve ever had!”\n– Emily R.",
      type: "caption",
      status: "completed",
      detectedLanguage: "EN",
      translationStatus: "idle"
    },
    {
      id: "sample-4",
      text: "Simple steps for\nthe perfect cup.",
      type: "subhead",
      status: "pending",
      detectedLanguage: "EN",
      translationStatus: "idle"
    },
    {
      id: "sample-5",
      text: "Sustainability, fairness,\nand quality in every step.",
      type: "paragraph",
      status: "completed",
      detectedLanguage: "EN",
      translationStatus: "idle"
    },
    {
      id: "sample-6",
      text: "100% Arabica beans\nNo additives or preservatives.",
      type: "list",
      status: "pending",
      detectedLanguage: "EN",
      translationStatus: "idle"
    },
    {
      id: "sample-7",
      text: "Try our new seasonal blend today!\nYou’ll love it.",
      type: "caption",
      status: "pending",
      detectedLanguage: "EN",
      translationStatus: "idle"
    }
  ];
}
