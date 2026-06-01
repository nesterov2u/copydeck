import { useRef, type PointerEvent } from "react";
import { BlockRow } from "./components/BlockRow";
import { BottomToolbar } from "./components/BottomToolbar";
import { Header } from "./components/Header";
import { Preview } from "./components/Preview";
import { ProgressSection } from "./components/ProgressSection";
import { Settings } from "./components/Settings";
import { useCopyDeckEffects } from "./hooks/useCopyDeckEffects";
import { useCopyDeckStore } from "./store/useCopyDeckStore";
import { blockPosition } from "./utils/text";

export function App() {
  const store = useCopyDeckStore();
  const dragStart = useRef<{ x: number; y: number; blocked: boolean } | null>(null);
  const dragStarted = useRef(false);
  const completed = store.blocks.filter((block) => block.status === "completed").length;
  const total = store.blocks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const currentBlock = store.blocks.find((block) => block.id === store.currentId) ?? store.blocks[0];

  useCopyDeckEffects(store.theme, store.pinned);

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
      className={`app-frame view-${store.view} ${store.compactMode ? "compact" : ""}`}
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
            {store.blocks.map((block) => (
              <BlockRow
                key={block.id}
                block={block}
                isCurrent={block.id === store.currentId}
                translationEnabled={store.translationEnabled}
                onOpen={() => store.openPreview(block.id)}
                onCopy={() => store.copyBlock(block.id)}
                onToggle={() => store.toggleCompleted(block.id)}
                onTranslate={() => store.translateBlock(block.id)}
              />
            ))}
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
      {store.toast && <div className={`toast ${store.toast.tone}`}>{store.toast.message}</div>}
    </main>
  );
}
