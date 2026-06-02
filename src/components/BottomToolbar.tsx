import { useCopyDeckStore } from "../store/useCopyDeckStore";
import { t } from "../services/i18n";

export function BottomToolbar() {
  const store = useCopyDeckStore();

  return (
    <footer className="bottom-area">
      <button className="primary-action" onClick={store.copyAndNext}>
        {t(store.interfaceLanguage, "copyAndNext")}
      </button>
    </footer>
  );
}
