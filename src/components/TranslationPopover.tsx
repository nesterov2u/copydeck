import type { TextBlock } from "../types";

export function TranslationPopover({ block }: { block: TextBlock }) {
  return (
    <aside className="translation-popover">
      <p className="popover-label">Original ({block.detectedLanguage ?? "AUTO"})</p>
      <p>{block.text}</p>
      <hr />
      <p className="popover-label">{languageLabel(block.targetLanguage ?? "RU")}</p>
      <p>
        {block.translationStatus === "loading"
          ? "Перевод..."
          : block.translationStatus === "error"
            ? "Перевод временно недоступен"
            : block.translation ?? "Наведи ещё раз для перевода"}
      </p>
    </aside>
  );
}

function languageLabel(language: string) {
  const labels: Record<string, string> = {
    DE: "German (DE)",
    EN: "English (EN)",
    ES: "Spanish (ES)",
    FR: "French (FR)",
    ID: "Indonesian (ID)",
    IT: "Italian (IT)",
    NL: "Dutch (NL)",
    PL: "Polish (PL)",
    PT: "Portuguese (PT)",
    RU: "Russian (RU)",
    TR: "Turkish (TR)"
  };

  return labels[language.toUpperCase()] ?? language.toUpperCase();
}
