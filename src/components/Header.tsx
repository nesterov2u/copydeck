import { Pin, PinOff, Plus, Settings } from "lucide-react";
import { readDocxFile, readSpreadsheetFile, readTextFile } from "../services/importers";
import { useCopyDeckStore } from "../store/useCopyDeckStore";
import type { ParseMode, ThemeMode } from "../types";

export function Header({ title }: { title: string }) {
  const store = useCopyDeckStore();

  return (
    <header className="window-header" data-tauri-drag-region>
      <div className="traffic-lights">
        <button className="traffic red" aria-label="Close" onClick={() => windowAction("close")} />
        <button className="traffic yellow" aria-label="Minimize" onClick={() => windowAction("minimize")} />
        <button className="traffic green" aria-label="Maximize" onClick={() => windowAction("toggleMaximize")} />
      </div>
      <strong className="window-title">{title}</strong>
      <div className="header-actions">
        <button className="icon-button" title="Импорт из буфера" onClick={store.importFromClipboard}>
          <Plus size={21} />
        </button>
        <button className="icon-button" title="Закрепить поверх окон" onClick={() => store.setPinned(!store.pinned)}>
          {store.pinned ? <PinOff size={19} /> : <Pin size={19} />}
        </button>
        <div className="theme-menu">
          <button className="icon-button" title="Настройки">
            <Settings size={19} />
          </button>
          <div className="theme-popover">
            <label className="field-label">
              Split mode
              <select value={store.parseMode} onChange={(event) => store.setParseMode(event.target.value as ParseMode)}>
                <option value="paragraph">Paragraph</option>
                <option value="line">Line</option>
                <option value="delimiter">Delimiter</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            {store.parseMode === "custom" && (
              <label className="field-label">
                Separator
                <input
                  value={store.customSeparator}
                  onChange={(event) => store.setCustomSeparator(event.target.value)}
                  placeholder="///"
                />
              </label>
            )}
            {(["system", "light", "dark"] as ThemeMode[]).map((item) => (
              <button
                key={item}
                className={store.theme === item ? "active" : ""}
                onClick={() => store.setTheme(item)}
              >
                {item === "system" ? "System" : item === "light" ? "Light" : "Dark"}
              </button>
            ))}
            <label className="file-import">
              Импорт файла
              <input
                type="file"
                accept=".txt,.docx,.xlsx,.xls,.csv"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const ext = file.name.split(".").pop()?.toLowerCase();
                  const text =
                    ext === "docx"
                      ? await readDocxFile(file)
                      : ext === "xlsx" || ext === "xls" || ext === "csv"
                        ? await readSpreadsheetFile(file)
                        : await readTextFile(file);
                  store.importText(text);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
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
