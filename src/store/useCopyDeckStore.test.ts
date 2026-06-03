import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCopyDeckStore } from "./useCopyDeckStore";
import { readClipboard, writeClipboard } from "../services/clipboard";

vi.mock("../services/clipboard", () => ({
  readClipboard: vi.fn(),
  writeClipboard: vi.fn()
}));

const mockedReadClipboard = vi.mocked(readClipboard);
const mockedWriteClipboard = vi.mocked(writeClipboard);

describe("useCopyDeckStore imports", () => {
  beforeEach(() => {
    mockedReadClipboard.mockReset();
    mockedWriteClipboard.mockReset();

    useCopyDeckStore.setState({
      blocks: [
        {
          id: "existing",
          text: "Existing block",
          type: "paragraph",
          status: "pending",
          translationStatus: "idle"
        }
      ],
      currentId: "existing",
      parseMode: "paragraph",
      customSeparator: "//",
      view: "preview",
      toast: null,
      pendingImport: null,
      recentImports: []
    });
  });

  it("keeps the current queue when imported text has no blocks", () => {
    useCopyDeckStore.getState().importText(" \n\n ");

    const state = useCopyDeckStore.getState();
    expect(state.blocks).toHaveLength(1);
    expect(state.blocks[0]?.id).toBe("existing");
    expect(state.currentId).toBe("existing");
    expect(state.view).toBe("preview");
    expect(state.toast).toEqual({ message: "Clipboard is empty", tone: "info" });
  });

  it("imports parsed blocks and returns to the list view", () => {
    useCopyDeckStore.getState().importText("First\n\nSecond");

    const state = useCopyDeckStore.getState();
    expect(state.blocks.map((block) => block.text)).toEqual(["First", "Second"]);
    expect(state.currentId).toBe(state.blocks[0]?.id);
    expect(state.view).toBe("list");
    expect(state.toast).toEqual({ message: "Imported 2 blocks", tone: "success" });
  });

  it("asks before replacing a deck that already has progress", () => {
    useCopyDeckStore.setState({
      blocks: [
        {
          id: "existing",
          text: "Existing block",
          type: "paragraph",
          status: "completed",
          translationStatus: "idle"
        }
      ],
      currentId: "existing",
      view: "preview",
      toast: null,
      pendingImport: null,
      recentImports: []
    });

    useCopyDeckStore.getState().importText("Fresh first\n\nFresh second");

    const state = useCopyDeckStore.getState();
    expect(state.blocks.map((block) => block.text)).toEqual(["Existing block"]);
    expect(state.currentId).toBe("existing");
    expect(state.view).toBe("preview");
    expect(state.pendingImport?.blocks.map((block) => block.text)).toEqual([
      "Fresh first",
      "Fresh second"
    ]);
    expect(state.toast).toEqual({ message: "Confirm deck replacement", tone: "info" });
  });

  it("can cancel or confirm a pending deck replacement", () => {
    useCopyDeckStore.setState({
      blocks: [
        {
          id: "existing",
          text: "Existing block",
          type: "paragraph",
          status: "completed",
          translationStatus: "idle"
        }
      ],
      currentId: "existing",
      view: "preview",
      toast: null,
      pendingImport: null,
      recentImports: []
    });

    useCopyDeckStore.getState().importText("Replacement");
    useCopyDeckStore.getState().cancelPendingImport();

    expect(useCopyDeckStore.getState().blocks.map((block) => block.text)).toEqual([
      "Existing block"
    ]);
    expect(useCopyDeckStore.getState().pendingImport).toBeNull();
    expect(useCopyDeckStore.getState().toast).toEqual({
      message: "Current deck kept",
      tone: "info"
    });

    useCopyDeckStore.getState().importText("Replacement");
    useCopyDeckStore.getState().confirmPendingImport();

    const state = useCopyDeckStore.getState();
    expect(state.blocks.map((block) => block.text)).toEqual(["Replacement"]);
    expect(state.currentId).toBe(state.blocks[0]?.id);
    expect(state.view).toBe("list");
    expect(state.pendingImport).toBeNull();
    expect(state.recentImports).toHaveLength(1);
    expect(state.recentImports[0]?.preview).toBe("Replacement");
    expect(state.toast).toEqual({ message: "Imported 1 blocks", tone: "success" });
  });

  it("imports plain text from the clipboard", async () => {
    mockedReadClipboard.mockResolvedValue("Clipboard first\n\nClipboard second");

    await useCopyDeckStore.getState().importFromClipboard();

    const state = useCopyDeckStore.getState();
    expect(mockedReadClipboard).toHaveBeenCalledOnce();
    expect(state.blocks.map((block) => block.text)).toEqual([
      "Clipboard first",
      "Clipboard second"
    ]);
    expect(state.currentId).toBe(state.blocks[0]?.id);
    expect(state.view).toBe("list");
    expect(state.toast).toEqual({ message: "Imported 2 blocks", tone: "success" });
  });

  it("keeps the current queue when the clipboard is empty", async () => {
    mockedReadClipboard.mockResolvedValue(" \n\n ");

    await useCopyDeckStore.getState().importFromClipboard();

    const state = useCopyDeckStore.getState();
    expect(mockedReadClipboard).toHaveBeenCalledOnce();
    expect(state.blocks).toHaveLength(1);
    expect(state.blocks[0]?.id).toBe("existing");
    expect(state.currentId).toBe("existing");
    expect(state.view).toBe("preview");
    expect(state.toast).toEqual({ message: "Clipboard is empty", tone: "info" });
  });

  it("shows an import failure toast when clipboard read fails", async () => {
    mockedReadClipboard.mockRejectedValue(new Error("clipboard unavailable"));

    await useCopyDeckStore.getState().importFromClipboard();

    const state = useCopyDeckStore.getState();
    expect(mockedReadClipboard).toHaveBeenCalledOnce();
    expect(state.blocks).toHaveLength(1);
    expect(state.blocks[0]?.id).toBe("existing");
    expect(state.currentId).toBe("existing");
    expect(state.view).toBe("preview");
    expect(state.toast).toEqual({ message: "Import failed", tone: "error" });
  });

  it("restores a recent import and clears the deck", () => {
    useCopyDeckStore.getState().importText("First recent\n\nSecond recent");
    const recentId = useCopyDeckStore.getState().recentImports[0]?.id;
    expect(recentId).toBeTruthy();

    useCopyDeckStore.getState().importText("Current only");
    useCopyDeckStore.getState().restoreRecentImport(recentId!);

    let state = useCopyDeckStore.getState();
    expect(state.blocks.map((block) => block.text)).toEqual(["First recent", "Second recent"]);
    expect(state.toast).toEqual({ message: "Restored 2 blocks", tone: "success" });

    useCopyDeckStore.getState().clearDeck();

    state = useCopyDeckStore.getState();
    expect(state.blocks).toEqual([]);
    expect(state.currentId).toBeNull();
    expect(state.view).toBe("list");
    expect(state.toast).toEqual({ message: "Deck cleared", tone: "success" });
  });
});

describe("useCopyDeckStore copied status", () => {
  beforeEach(() => {
    mockedReadClipboard.mockReset();
    mockedWriteClipboard.mockReset();

    useCopyDeckStore.setState({
      blocks: [
        {
          id: "current",
          text: "Current block",
          type: "paragraph",
          status: "pending",
          translationStatus: "idle"
        }
      ],
      currentId: "current"
    });
  });

  it("toggles the current block copied status", () => {
    useCopyDeckStore.getState().toggleCurrentCopied();
    expect(useCopyDeckStore.getState().blocks[0]?.status).toBe("completed");

    useCopyDeckStore.getState().toggleCurrentCopied();
    expect(useCopyDeckStore.getState().blocks[0]?.status).toBe("pending");

    useCopyDeckStore.setState({
      blocks: [{ ...useCopyDeckStore.getState().blocks[0]!, status: "skipped" }]
    });
    useCopyDeckStore.getState().toggleCurrentCopied();
    expect(useCopyDeckStore.getState().blocks[0]?.status).toBe("completed");
  });

  it("copies the current block and advances to the immediate next block", async () => {
    mockedWriteClipboard.mockResolvedValue();
    useCopyDeckStore.setState({
      blocks: [
        {
          id: "first",
          text: "First block",
          type: "paragraph",
          status: "pending",
          translationStatus: "idle"
        },
        {
          id: "second",
          text: "Second block",
          type: "paragraph",
          status: "completed",
          translationStatus: "idle"
        },
        {
          id: "third",
          text: "Third block",
          type: "paragraph",
          status: "pending",
          translationStatus: "idle"
        }
      ],
      currentId: "first",
      toast: null
    });

    await useCopyDeckStore.getState().copyAndNext();

    const state = useCopyDeckStore.getState();
    expect(mockedWriteClipboard).toHaveBeenCalledWith("First block");
    expect(state.blocks.map((block) => block.status)).toEqual([
      "completed",
      "completed",
      "pending"
    ]);
    expect(state.currentId).toBe("second");
    expect(state.toast).toEqual({ message: "Copied", tone: "success" });
  });
});
