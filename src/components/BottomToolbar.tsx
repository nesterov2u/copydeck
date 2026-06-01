import { useCopyDeckStore } from "../store/useCopyDeckStore";

export function BottomToolbar() {
  const store = useCopyDeckStore();

  return (
    <footer className="bottom-area">
      <button className="primary-action" onClick={store.copyAndNext}>Copy & Next</button>
    </footer>
  );
}
