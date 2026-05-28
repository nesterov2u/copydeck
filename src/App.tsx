import { useMemo } from "react";
import { BlockRow } from "./components/BlockRow";
import { BottomToolbar } from "./components/BottomToolbar";
import { FiltersRow } from "./components/FiltersRow";
import { Header } from "./components/Header";
import { Preview } from "./components/Preview";
import { ProgressSection } from "./components/ProgressSection";
import { useCopyDeckEffects } from "./hooks/useCopyDeckEffects";
import { useCopyDeckStore } from "./store/useCopyDeckStore";
import { blockPosition } from "./utils/text";

export function App() {
  const store = useCopyDeckStore();
  const completed = store.blocks.filter((block) => block.status === "completed").length;
  const total = store.blocks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const currentBlock = store.blocks.find((block) => block.id === store.currentId) ?? store.blocks[0];

  const visibleBlocks = useMemo(() => {
    const query = store.search.trim().toLowerCase();
    return store.blocks.filter((block) => {
      const byFilter = store.filter === "all" || block.status === store.filter;
      const bySearch =
        !query ||
        block.text.toLowerCase().includes(query) ||
        block.type.toLowerCase().includes(query);
      return byFilter && bySearch;
    });
  }, [store.blocks, store.filter, store.search]);

  useCopyDeckEffects(store.theme, store.pinned);

  return (
    <main className="app-frame">
      <Header title={store.view === "preview" && currentBlock ? blockPosition(store.blocks, currentBlock) : "CopyDeck"} />

      {store.view === "list" ? (
        <>
          <ProgressSection completed={completed} total={total} progress={progress} />
          <FiltersRow />
          <section className="block-list">
            {visibleBlocks.map((block) => (
              <BlockRow
                key={block.id}
                block={block}
                index={store.blocks.indexOf(block)}
                isCurrent={block.id === store.currentId}
                onSelect={() => store.setCurrent(block.id)}
                onOpen={() => store.openPreview(block.id)}
                onCopy={() => store.copyBlock(block.id)}
                onToggle={() => store.toggleCompleted(block.id)}
                onTranslate={() => store.translateBlock(block.id)}
              />
            ))}
          </section>
        </>
      ) : (
        currentBlock && <Preview block={currentBlock} />
      )}

      <BottomToolbar />
      {store.toast && <div className={`toast ${store.toast.tone}`}>{store.toast.message}</div>}
    </main>
  );
}
