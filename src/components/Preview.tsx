import { useEffect } from "react";
import { useCopyDeckStore } from "../store/useCopyDeckStore";
import { t } from "../services/i18n";
import type { BlockStatus, TextBlock } from "../types";
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
          <Icon name="arrowBackUp" size={20} /> {t(store.interfaceLanguage, "back")}
        </button>
        <span className="preview-position">{position}</span>
      </div>

      <article className="preview-card">
        <div className="preview-card-head">
          <button
            className={`status-button preview-status ${block.status}`}
            title={t(store.interfaceLanguage, "toggleStatus")}
            onClick={() => store.toggleCompleted(block.id)}
          >
            {statusIcon(block.status)}
          </button>
          <button
            className="copy-button-large"
            title={t(store.interfaceLanguage, "copy")}
            onClick={() => store.copyBlock(block.id)}
          >
            <Icon name="copy" size={24} />
          </button>
        </div>

        <p className="preview-text">{block.text}</p>

        {store.translationEnabled && (
          <section className="translation-panel">
            <strong>{t(store.interfaceLanguage, "translation")}</strong>
            <p>
              {block.translationStatus === "loading"
                ? t(store.interfaceLanguage, "translationLoading")
                : block.translationStatus === "error"
                  ? t(store.interfaceLanguage, "translationUnavailable")
                  : block.translation ??
                    t(store.interfaceLanguage, "translationUnavailableOriginal")}
            </p>
          </section>
        )}
      </article>
    </section>
  );
}

function statusIcon(status: BlockStatus) {
  if (status === "completed") return <Icon name="squareRoundedCheck" size={24} />;
  if (status === "skipped") return <span className="skip-mark" aria-hidden="true" />;
  return <Icon name="squareRoundedCheckOutline" size={24} />;
}
