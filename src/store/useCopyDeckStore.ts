import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BlockType,
  InterfaceLanguage,
  ParseMode,
  RecentImport,
  TextBlock,
  ThemeMode,
  ToastState,
  AppUpdateInfo,
  UpdateStatus
} from "../types";
import { t } from "../services/i18n";
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
  translationEnabled: boolean;
  targetLanguage: string;
  interfaceLanguage: InterfaceLanguage;
  theme: ThemeMode;
  view: "list" | "preview" | "settings";
  pinned: boolean;
  toast: ToastState;
  updateStatus: UpdateStatus;
  availableUpdate: AppUpdateInfo | null;
  pendingImport: RecentImport | null;
  recentImports: RecentImport[];
  importText: (text: string) => void;
  importFromClipboard: () => Promise<void>;
  confirmPendingImport: () => void;
  cancelPendingImport: () => void;
  restoreRecentImport: (id: string) => void;
  copyBlock: (id: string, advance?: boolean) => Promise<void>;
  copyCurrent: () => Promise<void>;
  copyAndNext: () => Promise<void>;
  setCurrent: (id: string) => void;
  openPreview: (id: string) => void;
  openSettings: () => void;
  backToList: () => void;
  setParseMode: (mode: ParseMode) => void;
  setCustomSeparator: (separator: string) => void;
  setTranslationEnabled: (enabled: boolean) => void;
  setTargetLanguage: (language: string) => void;
  setInterfaceLanguage: (language: InterfaceLanguage) => void;
  setTheme: (theme: ThemeMode) => void;
  setPinned: (pinned: boolean) => void;
  toggleCompleted: (id: string) => void;
  markSkipped: (id: string) => void;
  toggleCurrentCopied: () => void;
  goNext: () => void;
  goPrevious: () => void;
  separateCurrent: () => void;
  translateBlock: (id: string) => Promise<void>;
  checkForUpdates: () => Promise<void>;
  installUpdate: () => Promise<void>;
  clearCache: () => void;
  clearDeck: () => void;
  clearToast: () => void;
};

type PersistedCopyDeckState = Pick<
  CopyDeckState,
  | "blocks"
  | "currentId"
  | "parseMode"
  | "customSeparator"
  | "translationEnabled"
  | "targetLanguage"
  | "interfaceLanguage"
  | "theme"
  | "pinned"
  | "recentImports"
>;

export const useCopyDeckStore = create<CopyDeckState>()(
  persist(
    (set, get) => ({
      blocks: sampleBlocks(),
      currentId: "sample-1",
      parseMode: "paragraph",
      customSeparator: "//",
      translationEnabled: true,
      targetLanguage: "RU",
      interfaceLanguage: "en",
      theme: "system",
      view: "list",
      pinned: false,
      toast: null,
      updateStatus: "idle",
      availableUpdate: null,
      pendingImport: null,
      recentImports: [],
      importText: (text) => {
        const blocks = prepareImportedBlocks(text, get().parseMode, get().customSeparator);
        if (!blocks.length) {
          set({ toast: { message: t(get().interfaceLanguage, "clipboardEmpty"), tone: "info" } });
          return;
        }

        const importRecord = createRecentImport(blocks);
        if (hasDeckProgress(get().blocks)) {
          set({
            pendingImport: importRecord,
            toast: {
              message: t(get().interfaceLanguage, "replaceDeckConfirmToast"),
              tone: "info"
            }
          });
          return;
        }

        applyImport(set, get, importRecord);
      },
      importFromClipboard: async () => {
        try {
          const text = await readClipboard();
          get().importText(text);
        } catch {
          set({ toast: { message: t(get().interfaceLanguage, "importFailed"), tone: "error" } });
        }
      },
      confirmPendingImport: () => {
        const pendingImport = get().pendingImport;
        if (!pendingImport) return;
        applyImport(set, get, pendingImport);
      },
      cancelPendingImport: () =>
        set((state) => ({
          pendingImport: null,
          toast: { message: t(state.interfaceLanguage, "currentDeckKept"), tone: "info" }
        })),
      restoreRecentImport: (id) => {
        const recentImport = get().recentImports.find((item) => item.id === id);
        if (!recentImport) return;
        set((state) => ({
          blocks: cloneBlocks(recentImport.blocks),
          currentId: recentImport.blocks[0]?.id ?? null,
          view: "list",
          pendingImport: null,
          toast: {
            message: t(state.interfaceLanguage, "deckRestored", {
              count: recentImport.blockCount
            }),
            tone: "success"
          }
        }));
      },
      copyBlock: async (id, advance = false) => {
        const block = get().blocks.find((item) => item.id === id);
        if (!block) return;
        await writeClipboard(block.text);
        set((state) => ({
          blocks: state.blocks.map((item) =>
            item.id === id ? { ...item, status: "completed" } : item
          ),
          toast: { message: t(state.interfaceLanguage, "copied"), tone: "success" }
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
      setTranslationEnabled: (translationEnabled) => set({ translationEnabled }),
      setTargetLanguage: (targetLanguage) => set({ targetLanguage: targetLanguage.toUpperCase() }),
      setInterfaceLanguage: (interfaceLanguage) => set({ interfaceLanguage }),
      setTheme: (theme) => set({ theme }),
      setPinned: (pinned) => set({ pinned }),
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
      toggleCurrentCopied: () =>
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === state.currentId
              ? { ...block, status: block.status === "completed" ? "pending" : "completed" }
              : block
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
          set({
            toast: {
              message: t(get().interfaceLanguage, "blockCannotBeSeparated"),
              tone: "info"
            }
          });
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
          toast: {
            message: t(get().interfaceLanguage, "separatedBlocks", { count: separated.length }),
            tone: "success"
          }
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
          set({
            toast: { message: t(get().interfaceLanguage, "translationUnavailable"), tone: "error" }
          });
        }
      },
      checkForUpdates: async () => {
        if (get().updateStatus === "checking" || get().updateStatus === "updating") return;

        set({
          updateStatus: "checking",
          toast: { message: t(get().interfaceLanguage, "checkingUpdates"), tone: "info" }
        });
        try {
          const update = await checkForAppUpdate();
          set({
            updateStatus: update ? "available" : "idle",
            availableUpdate: update,
            toast: update
              ? {
                  message: t(get().interfaceLanguage, "updateAvailable", {
                    version: update.version
                  }),
                  tone: "info"
                }
              : { message: t(get().interfaceLanguage, "copyDeckUpToDate"), tone: "success" }
          });
        } catch {
          set({
            updateStatus: "idle",
            availableUpdate: null,
            toast: { message: t(get().interfaceLanguage, "noUpdateAvailableYet"), tone: "info" }
          });
        }
      },
      installUpdate: async () => {
        if (get().updateStatus === "updating") return;

        set({
          updateStatus: "updating",
          toast: { message: t(get().interfaceLanguage, "installingUpdate"), tone: "info" }
        });
        try {
          await installPendingAppUpdate();
        } catch {
          set({
            updateStatus: get().availableUpdate ? "available" : "idle",
            toast: { message: t(get().interfaceLanguage, "updateInstallFailed"), tone: "error" }
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
          toast: { message: t(state.interfaceLanguage, "cacheCleared"), tone: "success" }
        })),
      clearDeck: () =>
        set((state) => ({
          blocks: [],
          currentId: null,
          view: "list",
          pendingImport: null,
          toast: { message: t(state.interfaceLanguage, "deckCleared"), tone: "success" }
        })),
      clearToast: () => set({ toast: null })
    }),
    {
      name: "copydeck-state",
      version: 7,
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
          translationEnabled: state.translationEnabled ?? true,
          targetLanguage: state.targetLanguage ?? "RU",
          interfaceLanguage: state.interfaceLanguage ?? "en",
          theme: state.theme ?? "system",
          pinned: state.pinned ?? false,
          recentImports: normalizeRecentImports(state.recentImports)
        };
      },
      partialize: (state) => ({
        blocks: state.blocks,
        currentId: state.currentId,
        parseMode: state.parseMode,
        customSeparator: state.customSeparator,
        translationEnabled: state.translationEnabled,
        targetLanguage: state.targetLanguage,
        interfaceLanguage: state.interfaceLanguage,
        theme: state.theme,
        pinned: state.pinned,
        recentImports: state.recentImports
      })
    }
  )
);

function prepareImportedBlocks(text: string, parseMode: ParseMode, customSeparator: string) {
  return parseTextToBlocks(text, parseMode, customSeparator).map((block) => ({
    ...block,
    detectedLanguage: detectLanguage(block.text)
  }));
}

function applyImport(
  set: (
    partial:
      | Partial<CopyDeckState>
      | ((state: CopyDeckState) => Partial<CopyDeckState>)
  ) => void,
  get: () => CopyDeckState,
  importRecord: RecentImport
) {
  set((state) => ({
    blocks: cloneBlocks(importRecord.blocks),
    currentId: importRecord.blocks[0]?.id ?? null,
    view: "list",
    pendingImport: null,
    recentImports: addRecentImport(state.recentImports, importRecord),
    toast: {
      message: t(get().interfaceLanguage, "importedBlocks", {
        count: importRecord.blockCount
      }),
      tone: "success"
    }
  }));
}

function hasDeckProgress(blocks: TextBlock[]) {
  return blocks.some((block) => block.status === "completed" || block.status === "skipped");
}

function createRecentImport(blocks: TextBlock[]): RecentImport {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    blockCount: blocks.length,
    preview: blocks[0]?.text.replace(/\s+/g, " ").trim().slice(0, 80) || "",
    blocks: cloneBlocks(blocks)
  };
}

function addRecentImport(recentImports: RecentImport[], importRecord: RecentImport) {
  return [importRecord, ...recentImports.filter((item) => item.id !== importRecord.id)].slice(0, 5);
}

function cloneBlocks(blocks: TextBlock[]) {
  return blocks.map((block) => ({ ...block }));
}

function normalizeRecentImports(recentImports?: RecentImport[]) {
  if (!Array.isArray(recentImports)) return [];
  return recentImports
    .filter((item) => item && Array.isArray(item.blocks) && item.blocks.length)
    .map((item) => ({
      ...item,
      blocks: item.blocks.map((block) => ({
        ...block,
        type: normalizeBlockType(block.type)
      }))
    }))
    .slice(0, 5);
}

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
