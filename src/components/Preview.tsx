import { useEffect } from "react";
import { useCopyDeckStore } from "../store/useCopyDeckStore";
import type { TextBlock } from "../types";
import { Icon } from "./Icon";

export function Preview({ block, position }: { block: TextBlock; position: string }) {
  const store = useCopyDeckStore();

  useEffect(() => {
    if (!store.translationEnabled) return;
    store.translateBlock(block.id);
  }, [block.id, store, store.translationEnabled]);

  return (
    <section className="preview-mode">
      <div className="preview-topline">
        <button className="back-button" onClick={store.backToList}>
          <Icon name="arrowBackUp" size={20} /> Back
        </button>
        <span className="preview-position">{position}</span>
      </div>

      <article className="preview-card">
        <div className="preview-card-head">
          <span />
          <button className="copy-button-large" title="Скопировать" onClick={() => store.copyBlock(block.id)}>
            <Icon name="copy" size={24} />
          </button>
        </div>

        <p className="preview-text">{block.text}</p>

        {store.translationEnabled && (
          <section className="translation-panel">
            <strong>Перевод</strong>
            <p>
              {block.translationStatus === "loading"
                ? "Перевод..."
                : block.translationStatus === "error"
                  ? "Перевод временно недоступен"
                : block.translation ?? "Перевод недоступен. Оригинальный текст останется без изменений."}
            </p>
          </section>
        )}
      </article>
    </section>
  );
}
