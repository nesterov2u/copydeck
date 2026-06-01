import { useCopyDeckStore } from "../store/useCopyDeckStore";
import { Icon } from "./Icon";

export function Header({ title }: { title: string }) {
  const store = useCopyDeckStore();

  return (
    <header className="window-header" data-tauri-drag-region>
      <div className="traffic-lights">
        <button className="traffic red" aria-label="Close" onClick={() => windowAction("close")} />
        <button className="traffic yellow" aria-label="Minimize" onClick={() => windowAction("minimize")} />
        <button className="traffic green" aria-label="Maximize" onClick={() => windowAction("toggleMaximize")} />
      </div>
      <strong className="window-title">
        <Icon name="logo" size={129} />
        <span>{title}</span>
      </strong>
      <div className="header-actions">
        <button className="icon-button" title="Вставить из буфера" onClick={store.importFromClipboard}>
          <Icon name="playlistAdd" size={22} />
        </button>
        <button
          className={`icon-button ${store.pinned ? "active" : ""}`}
          title={store.pinned ? "Открепить окно" : "Закрепить поверх окон"}
          aria-pressed={store.pinned}
          onClick={() => store.setPinned(!store.pinned)}
        >
          <Icon name={store.pinned ? "unpin" : "pinned"} size={21} />
        </button>
        <button className="icon-button settings-button" title="Настройки" onClick={store.openSettings}>
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
