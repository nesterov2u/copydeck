import { useEffect, useRef, type PointerEvent } from "react";
import { BlockRow } from "./components/BlockRow";
import { BottomToolbar } from "./components/BottomToolbar";
import { Header } from "./components/Header";
import { Preview } from "./components/Preview";
import { ProgressSection } from "./components/ProgressSection";
import { Settings } from "./components/Settings";
import { useCopyDeckEffects } from "./hooks/useCopyDeckEffects";
import { t } from "./services/i18n";
import { useCopyDeckStore } from "./store/useCopyDeckStore";
import { blockPosition } from "./utils/text";
import emptyDeckIcon from "../icons/tabler_circle-dashed-plus.svg?url";

export function App() {
  const store = useCopyDeckStore();
  const dragStart = useRef<{ x: number; y: number; blocked: boolean } | null>(null);
  const dragStarted = useRef(false);
  const completed = store.blocks.filter((block) => block.status === "completed").length;
  const total = store.blocks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const currentBlock = store.blocks.find((block) => block.id === store.currentId) ?? store.blocks[0];

  useCopyDeckEffects(store.theme, store.pinned);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (store.view === "settings" || isEditableShortcutTarget(event.target)) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        store.goNext();
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        store.goPrevious();
      }

      if (event.key === "ArrowRight" && store.view === "list") {
        event.preventDefault();
        store.toggleCurrentCopied();
      }

      if (event.key === "ArrowLeft" && store.view === "list") {
        event.preventDefault();
        store.toggleCurrentCopied();
      }

      if ((event.key === " " || event.key === "Spacebar") && !event.repeat) {
        event.preventDefault();
        void store.copyAndNext();
      }

      if (event.key === "Enter" && store.view === "list" && store.currentId) {
        event.preventDefault();
        store.openPreview(store.currentId);
      }

      if (event.key === "Backspace" && store.view === "preview") {
        event.preventDefault();
        store.backToList();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [store]);

  useEffect(() => {
    if (store.view !== "list") return;
    document.querySelector(".block-row.current")?.scrollIntoView({
      block: "nearest",
      inline: "nearest"
    });
  }, [store.currentId, store.view]);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      blocked: Boolean(target?.closest(".primary-action, input, textarea, select"))
    };
    dragStarted.current = false;
  };

  const onPointerMove = async (event: PointerEvent<HTMLElement>) => {
    const start = dragStart.current;
    if (!start || start.blocked || dragStarted.current) return;

    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (distance < 5) return;

    dragStarted.current = true;
    dragStart.current = null;
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().startDragging();
    } catch {
      // Browser preview has no native window to drag.
    }
  };

  const resetDrag = () => {
    dragStart.current = null;
  };

  return (
    <main
      className={`app-frame view-${store.view}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={resetDrag}
      onPointerCancel={resetDrag}
    >
      <Header title="CopyDeck" />

      {store.view === "settings" ? (
        <Settings />
      ) : store.view === "list" ? (
        <>
          <ProgressSection completed={completed} total={total} progress={progress} />
          <section className="block-list">
            {store.blocks.length ? (
              store.blocks.map((block) => (
                <BlockRow
                  key={block.id}
                  block={block}
                  isCurrent={block.id === store.currentId}
                  interfaceLanguage={store.interfaceLanguage}
                  translationEnabled={store.translationEnabled}
                  onOpen={() => store.openPreview(block.id)}
                  onCopy={() => store.copyBlock(block.id)}
                  onToggle={() => store.toggleCompleted(block.id)}
                  onTranslate={() => store.translateBlock(block.id)}
                />
              ))
            ) : (
              <div className="empty-deck" aria-hidden="true">
                <img src={emptyDeckIcon} alt="" />
              </div>
            )}
          </section>
        </>
      ) : (
        currentBlock && (
          <Preview
            block={currentBlock}
            position={blockPosition(store.blocks, currentBlock)}
          />
        )
      )}

      {store.view !== "settings" && <BottomToolbar />}
      {store.pendingImport && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-card">
            <strong>{t(store.interfaceLanguage, "replaceDeckConfirmTitle")}</strong>
            <p>
              {t(store.interfaceLanguage, "replaceDeckConfirmBody", {
                count: store.pendingImport.blockCount
              })}
            </p>
            <div className="confirm-actions">
              <button className="confirm-secondary" onClick={store.cancelPendingImport}>
                {t(store.interfaceLanguage, "back")}
              </button>
              <button className="confirm-primary" onClick={store.confirmPendingImport}>
                {t(store.interfaceLanguage, "replaceDeck")}
              </button>
            </div>
          </div>
        </div>
      )}
      {store.toast && <div className={`toast ${store.toast.tone}`}>{store.toast.message}</div>}
    </main>
  );
}

function isEditableShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}
