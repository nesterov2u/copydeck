import { ArrowLeft, Clipboard, Globe2 } from "lucide-react";
import { useCopyDeckStore } from "../store/useCopyDeckStore";
import type { TextBlock } from "../types";
import { firstLine } from "../utils/text";
import { typeLabels } from "./blockLabels";

export function Preview({ block }: { block: TextBlock }) {
  const store = useCopyDeckStore();

  return (
    <section className="preview-mode">
      <div className="preview-topline">
        <button className="back-button" onClick={store.backToList}>
          <ArrowLeft size={17} /> К списку
        </button>
        <div className="preview-meta">
          <span className={`type-tag ${block.type}`}>{typeLabels[block.type]}</span>
          <span>{block.text.length} символов</span>
          <span><Globe2 size={16} /> {block.detectedLanguage ?? "AUTO"} → RU</span>
        </div>
      </div>
      <h1>{firstLine(block.text)}</h1>
      <p className="preview-text">{block.text}</p>
      <div className="dashed-divider" />
      <article className="translation-panel">
        <div>
          <strong>Русский перевод (RU)</strong>
          <button className="icon-button quiet" onClick={() => store.copyBlock(block.id)}>
            <Clipboard size={18} />
          </button>
        </div>
        <p>{block.translationStatus === "loading" ? "Перевод..." : block.translation ?? "Перевод появится после нажатия на глобус в списке."}</p>
        <small>Перевод для понимания. Оригинальный текст не изменяется.</small>
      </article>
    </section>
  );
}
