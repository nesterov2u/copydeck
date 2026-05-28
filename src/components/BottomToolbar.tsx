import { ArrowLeft, ArrowRight, Check, ListChecks, RotateCcw } from "lucide-react";
import { useCopyDeckStore } from "../store/useCopyDeckStore";

export function BottomToolbar() {
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
