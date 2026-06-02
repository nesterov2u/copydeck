import { languageLabel, t } from "../services/i18n";
import type { InterfaceLanguage, TextBlock } from "../types";

export function TranslationPopover({
  block,
  interfaceLanguage
}: {
  block: TextBlock;
  interfaceLanguage: InterfaceLanguage;
}) {
  return (
    <aside className="translation-popover">
      <p className="popover-label">
        {t(interfaceLanguage, "original")} ({block.detectedLanguage ?? "AUTO"})
      </p>
      <p>{block.text}</p>
      <hr />
      <p className="popover-label">
        {languageLabel(block.targetLanguage ?? "RU", interfaceLanguage)}
      </p>
      <p>
        {block.translationStatus === "loading"
          ? t(interfaceLanguage, "translationLoading")
          : block.translationStatus === "error"
            ? t(interfaceLanguage, "translationUnavailable")
            : block.translation ?? t(interfaceLanguage, "translationHoverAgain")}
      </p>
    </aside>
  );
}
