import type { BlockStatus, TextBlock } from "../types";
import type { InterfaceLanguage } from "../types";
import { t } from "../services/i18n";
import { firstLine, secondLine } from "../utils/text";
import { Icon } from "./Icon";
import { TranslationPopover } from "./TranslationPopover";

export function BlockRow({
  block,
  isCurrent,
  interfaceLanguage,
  translationEnabled,
  onOpen,
  onCopy,
  onToggle,
  onTranslate
}: {
  block: TextBlock;
  isCurrent: boolean;
  interfaceLanguage: InterfaceLanguage;
  translationEnabled: boolean;
  onOpen: () => void;
  onCopy: () => void;
  onToggle: () => void;
  onTranslate: () => void;
}) {
  return (
    <article
      className={`block-row ${isCurrent ? "current" : ""} ${translationEnabled ? "" : "without-translation"}`}
      onClick={onOpen}
    >
      <button className={`status-button ${block.status}`} onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}>
        {statusIcon(block.status)}
      </button>
      <button className="block-content" onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}>
        <strong>{firstLine(block.text)}</strong>
        <span>{secondLine(block.text)}</span>
      </button>
      {translationEnabled && (
        <div className="translation-trigger">
          <button className="icon-button quiet" title={t(interfaceLanguage, "translation")} onMouseEnter={onTranslate} onClick={(event) => {
            event.stopPropagation();
            onTranslate();
          }}>
            <Icon name="worldBolt" size={22} />
          </button>
          <TranslationPopover block={block} interfaceLanguage={interfaceLanguage} />
        </div>
      )}
      <button className="copy-button-row" title={t(interfaceLanguage, "copy")} onClick={(event) => {
        event.stopPropagation();
        onCopy();
      }}>
        <Icon name="copy" size={24} />
      </button>
    </article>
  );
}

function statusIcon(status: BlockStatus) {
  if (status === "completed") return <Icon name="squareRoundedCheck" size={24} />;
  if (status === "skipped") return <span className="skip-mark" aria-hidden="true" />;
  return <Icon name="squareRoundedCheckOutline" size={24} />;
}
