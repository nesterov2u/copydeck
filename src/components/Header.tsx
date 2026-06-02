import { useCopyDeckStore } from "../store/useCopyDeckStore";
import { t } from "../services/i18n";
import { Icon } from "./Icon";

export function Header({ title }: { title: string }) {
  const store = useCopyDeckStore();

  return (
    <header className="window-header" data-tauri-drag-region>
      <div className="traffic-lights">
        <button
          className="traffic red"
          aria-label={t(store.interfaceLanguage, "close")}
          onClick={() => windowAction("close")}
        />
        <button
          className="traffic yellow"
          aria-label={t(store.interfaceLanguage, "minimize")}
          onClick={() => windowAction("minimize")}
        />
        <button
          className="traffic green"
          aria-label={t(store.interfaceLanguage, "maximize")}
          onClick={() => windowAction("toggleMaximize")}
        />
      </div>
      <strong className="window-title">
        <Icon name="logo" size={129} />
        <span>{title}</span>
      </strong>
      <div className="header-actions">
        <button
          className="icon-button"
          title={t(store.interfaceLanguage, "import")}
          onClick={store.importFromClipboard}
        >
          <Icon name="playlistAdd" size={22} />
        </button>
        <button
          className={`icon-button ${store.pinned ? "active" : ""}`}
          title={
            store.pinned
              ? t(store.interfaceLanguage, "unpinWindow")
              : t(store.interfaceLanguage, "pinWindow")
          }
          aria-pressed={store.pinned}
          onClick={() => store.setPinned(!store.pinned)}
        >
          <Icon name={store.pinned ? "unpin" : "pinned"} size={21} />
        </button>
        <button
          className="icon-button settings-button"
          title={t(store.interfaceLanguage, "settings")}
          onClick={store.openSettings}
        >
          <Icon name="settings" size={22} />
        </button>
      </div>
    </header>
  );
}

async function windowAction(action: "close" | "minimize" | "toggleMaximize") {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    if (action === "close") await win.close();
    if (action === "minimize") await win.minimize();
    if (action === "toggleMaximize") await win.toggleMaximize();
  } catch {
    if (action === "close") window.close();
  }
}
