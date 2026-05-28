import type { TextBlock } from "../types";

export function TranslationPopover({ block }: { block: TextBlock }) {
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
