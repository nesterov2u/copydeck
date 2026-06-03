import { useCopyDeckStore } from "../store/useCopyDeckStore";
import { t } from "../services/i18n";

export function BottomToolbar() {
  const store = useCopyDeckStore();
  const hasBlocks = store.blocks.length > 0;

  return (
    <footer className="bottom-area">
      <button className="primary-action" disabled={!hasBlocks} onClick={store.copyAndNext}>
        {t(store.interfaceLanguage, "copyAndNext")}
      </button>
    </footer>
  );
}
