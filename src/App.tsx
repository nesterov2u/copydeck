import { useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Clipboard,
  Filter,
  Globe2,
  ListChecks,
  Minus,
  Pin,
  PinOff,
  Plus,
  RotateCcw,
  Search,
  Settings,
} from "lucide-react";
import { readDocxFile, readSpreadsheetFile, readTextFile } from "./services/importers";
import { useCopyDeckStore } from "./store/useCopyDeckStore";
import type { BlockStatus, FilterMode, ParseMode, TextBlock, ThemeMode } from "./types";

const filterLabels: Record<FilterMode, string> = {
  all: "Все блоки",
  pending: "Ожидают",
  completed: "Готово",
  skipped: "Пропущено"
};

const typeLabels: Record<TextBlock["type"], string> = {
  heading: "H1",
  paragraph: "P",
  quote: "QUOTE",
  caption: "CAP",
  cta: "CTA",
  list: "LIST",
  table: "TABLE",
  unknown: "TXT"
};

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

  useTheme(store.theme);
  useTauriWindow(store.pinned);
  useHotkeys();
  useToastTimeout();

  return (
    <main className="app-frame">
      <Header
        title={store.view === "preview" && currentBlock ? blockPosition(store.blocks, currentBlock) : "CopyDeck"}
        pinned={store.pinned}
        onImport={store.importFromClipboard}
        onTogglePin={() => store.setPinned(!store.pinned)}
        theme={store.theme}
        setTheme={store.setTheme}
      />

      {store.view === "list" ? (
        <>
          <section className="progress-section">
            <div className="progress-meta">
              <span>{completed} / {total} блоков</span>
              <strong>{progress}%</strong>
              <ListChecks size={18} />
            </div>
            <div className="progress-track">
              <div className="progress-value" style={{ width: `${progress}%` }} />
            </div>
          </section>

          <section className="filters-row">
            <select value={store.filter} onChange={(event) => store.setFilter(event.target.value as FilterMode)}>
              {Object.entries(filterLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <label className="search-field">
              <Search size={17} />
              <input
                value={store.search}
                onChange={(event) => store.setSearch(event.target.value)}
                placeholder="Поиск..."
              />
            </label>
            <button className="icon-button" title="Фильтры">
              <Filter size={18} />
            </button>
          </section>

          <section className="block-list">
            {visibleBlocks.map((block, index) => (
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

function Header({
  title,
  pinned,
  onImport,
  onTogglePin,
  theme,
  setTheme
}: {
  title: string;
  pinned: boolean;
  onImport: () => void;
  onTogglePin: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}) {
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
        <button className="icon-button" title="Импорт из буфера" onClick={onImport}>
          <Plus size={21} />
        </button>
        <button className="icon-button" title="Закрепить поверх окон" onClick={onTogglePin}>
          {pinned ? <PinOff size={19} /> : <Pin size={19} />}
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
                className={theme === item ? "active" : ""}
                onClick={() => setTheme(item)}
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

function BlockRow({
  block,
  index,
  isCurrent,
  onSelect,
  onOpen,
  onCopy,
  onToggle,
  onTranslate
}: {
  block: TextBlock;
  index: number;
  isCurrent: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onCopy: () => void;
  onToggle: () => void;
  onTranslate: () => void;
}) {
  return (
    <article className={`block-row ${isCurrent ? "current" : ""}`} onClick={onSelect}>
      <button className={`status-button ${block.status}`} onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}>
        {statusIcon(block.status, isCurrent)}
      </button>
      <span className="block-number">{index + 1}</span>
      <button className="block-content" onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}>
        <strong>{firstLine(block.text)}</strong>
        <span>{secondLine(block.text)}</span>
      </button>
      <span className={`type-tag ${block.type}`}>{typeLabels[block.type]}</span>
      <button className="icon-button quiet" title="Скопировать" onClick={(event) => {
        event.stopPropagation();
        onCopy();
      }}>
        <Clipboard size={18} />
      </button>
      <div className="translation-trigger">
        <button className="icon-button quiet" title="Перевод" onMouseEnter={onTranslate} onClick={(event) => {
          event.stopPropagation();
          onTranslate();
        }}>
          <Globe2 size={20} />
        </button>
        <TranslationPopover block={block} />
      </div>
    </article>
  );
}

function TranslationPopover({ block }: { block: TextBlock }) {
  return (
    <aside className="translation-popover">
      <p className="popover-label">Original ({block.detectedLanguage ?? "AUTO"})</p>
      <p>{block.text}</p>
      <hr />
      <p className="popover-label">Russian (RU)</p>
      <p>{block.translationStatus === "loading" ? "Перевод..." : block.translation ?? "Наведи ещё раз для перевода"}</p>
    </aside>
  );
}

function Preview({ block }: { block: TextBlock }) {
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

function BottomToolbar() {
  const store = useCopyDeckStore();

  if (store.view === "preview") {
    return (
      <footer className="bottom-area preview-actions">
        <div className="copy-status">
          <span className="status-dot"><Check size={17} /></span>
          <span>Скопировано<br /><small>12:45:31</small></span>
        </div>
        <button className="secondary-button" onClick={() => store.toggleCompleted(store.currentId ?? "")}>
          <RotateCcw size={18} /> Отметить как не скопировано
        </button>
        <nav className="toolbar-row">
          <button className="nav-button" onClick={store.goPrevious}><ArrowLeft /></button>
          <button className="primary-action" onClick={store.copyAndNext}>Copy & Next <span>⌘⇧C</span></button>
          <button className="nav-button" onClick={store.goNext}><ArrowRight /></button>
        </nav>
      </footer>
    );
  }

  return (
    <footer className="bottom-area">
      <button className="nav-button" title="Фильтры"><ListChecks /></button>
      <button className="primary-action" onClick={store.copyAndNext}>Copy & Next <span>⌘⇧C</span></button>
      <button className="nav-button" onClick={store.goPrevious}><ArrowLeft /></button>
      <button className="nav-button" onClick={store.goNext}><ArrowRight /></button>
    </footer>
  );
}

function useTheme(theme: ThemeMode) {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      root.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}

function useTauriWindow(pinned: boolean) {
  useEffect(() => {
    import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => getCurrentWindow().setAlwaysOnTop(pinned))
      .catch(() => undefined);
  }, [pinned]);
}

function useHotkeys() {
  const copyAndNext = useCopyDeckStore((state) => state.copyAndNext);
  const copyCurrent = useCopyDeckStore((state) => state.copyCurrent);
  const goNext = useCopyDeckStore((state) => state.goNext);
  const goPrevious = useCopyDeckStore((state) => state.goPrevious);

  useEffect(() => {
    let unregisterGlobal: (() => void) | undefined;
    import("@tauri-apps/plugin-global-shortcut")
      .then(async ({ register, unregister }) => {
        const shortcuts = [
          ["CommandOrControl+Shift+C", copyAndNext],
          ["CommandOrControl+Shift+V", copyCurrent],
          ["CommandOrControl+Shift+Right", goNext],
          ["CommandOrControl+Shift+Left", goPrevious]
        ] as const;

        await Promise.all(shortcuts.map(([shortcut, handler]) => register(shortcut, handler)));
        unregisterGlobal = () => {
          shortcuts.forEach(([shortcut]) => {
            unregister(shortcut).catch(() => undefined);
          });
        };
      })
      .catch(() => undefined);

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || !event.shiftKey) return;
      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        copyAndNext();
      }
      if (event.key.toLowerCase() === "v") {
        event.preventDefault();
        copyCurrent();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unregisterGlobal?.();
    };
  }, [copyAndNext, copyCurrent, goNext, goPrevious]);
}

function useToastTimeout() {
  const toast = useCopyDeckStore((state) => state.toast);
  const clearToast = useCopyDeckStore((state) => state.clearToast);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 1800);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);
}

function blockPosition(blocks: TextBlock[], block: TextBlock) {
  return `${blocks.findIndex((item) => item.id === block.id) + 1} / ${blocks.length}`;
}

function firstLine(text: string) {
  return text.split("\n")[0] ?? text;
}

function secondLine(text: string) {
  const lines = text.split("\n");
  return lines.slice(1).join(" ") || text;
}

function statusIcon(status: BlockStatus, isCurrent: boolean) {
  if (isCurrent) return <ArrowRight size={16} />;
  if (status === "completed") return <Check size={16} />;
  if (status === "skipped") return <Minus size={16} />;
  return <Circle size={15} />;
}
