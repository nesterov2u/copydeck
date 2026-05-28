import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FilterMode, ParseMode, TextBlock, ThemeMode, ToastState } from "../types";
import { parseTextToBlocks } from "../services/parser";
import { readClipboard, writeClipboard } from "../services/clipboard";
import { getNextBlockId, getPreviousBlockId } from "../services/queue";
import { detectLanguage, translateText } from "../services/translation";

type CopyDeckState = {
  blocks: TextBlock[];
  currentId: string | null;
  filter: FilterMode;
  search: string;
  parseMode: ParseMode;
  customSeparator: string;
  theme: ThemeMode;
  view: "list" | "preview";
  pinned: boolean;
  toast: ToastState;
  importText: (text: string) => void;
  importFromClipboard: () => Promise<void>;
  copyBlock: (id: string, advance?: boolean) => Promise<void>;
  copyCurrent: () => Promise<void>;
  copyAndNext: () => Promise<void>;
  setCurrent: (id: string) => void;
  openPreview: (id: string) => void;
  backToList: () => void;
  setFilter: (filter: FilterMode) => void;
  setSearch: (search: string) => void;
  setParseMode: (mode: ParseMode) => void;
  setCustomSeparator: (separator: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setPinned: (pinned: boolean) => void;
  toggleCompleted: (id: string) => void;
  markSkipped: (id: string) => void;
  goNext: () => void;
  goPrevious: () => void;
  translateBlock: (id: string) => Promise<void>;
  clearToast: () => void;
};

export const useCopyDeckStore = create<CopyDeckState>()(
  persist(
    (set, get) => ({
      blocks: sampleBlocks(),
      currentId: "sample-1",
      filter: "all",
      search: "",
      parseMode: "paragraph",
      customSeparator: "",
      theme: "system",
      view: "list",
      pinned: false,
      toast: null,
      importText: (text) => {
        const blocks = parseTextToBlocks(text, get().parseMode, get().customSeparator);
        set({
          blocks,
          currentId: blocks[0]?.id ?? null,
          view: "list",
          toast: { message: `Imported ${blocks.length} blocks`, tone: "success" }
        });
      },
      importFromClipboard: async () => {
        const text = await readClipboard();
        get().importText(text);
      },
      copyBlock: async (id, advance = false) => {
        const block = get().blocks.find((item) => item.id === id);
        if (!block) return;
        await writeClipboard(block.text);
        set({ toast: { message: "Copied", tone: "success" } });
        if (advance) {
          set((state) => ({
            blocks: state.blocks.map((item) =>
              item.id === id ? { ...item, status: "completed" } : item
            )
          }));
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
      backToList: () => set({ view: "list" }),
      setFilter: (filter) => set({ filter }),
      setSearch: (search) => set({ search }),
      setParseMode: (parseMode) => set({ parseMode }),
      setCustomSeparator: (customSeparator) => set({ customSeparator }),
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
      goNext: () => {
        const { blocks, currentId } = get();
        set({ currentId: getNextBlockId(blocks, currentId) });
      },
      goPrevious: () => {
        const { blocks, currentId } = get();
        set({ currentId: getPreviousBlockId(blocks, currentId) });
      },
      translateBlock: async (id) => {
        const block = get().blocks.find((item) => item.id === id);
        if (!block || block.translationStatus === "loading") return;
        if (block.translation) return;

        setBlock(id, { translationStatus: "loading", detectedLanguage: detectLanguage(block.text) });
        try {
          const translated = await translateText(block.text);
          setBlock(id, {
            translation: translated.translatedText,
            detectedLanguage: translated.sourceLanguage,
            targetLanguage: translated.targetLanguage,
            translationStatus: "ready"
          });
        } catch {
          setBlock(id, { translationStatus: "error" });
        }
      },
      clearToast: () => set({ toast: null })
    }),
    {
      name: "copydeck-state",
      partialize: (state) => ({
        blocks: state.blocks,
        currentId: state.currentId,
        filter: state.filter,
        search: state.search,
        parseMode: state.parseMode,
        customSeparator: state.customSeparator,
        theme: state.theme,
        pinned: state.pinned
      })
    }
  )
);

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
      type: "heading",
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
      type: "quote",
      status: "completed",
      detectedLanguage: "EN",
      translationStatus: "idle"
    },
    {
      id: "sample-4",
      text: "Simple steps for\nthe perfect cup.",
      type: "heading",
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
      type: "cta",
      status: "pending",
      detectedLanguage: "EN",
      translationStatus: "idle"
    }
  ];
}
