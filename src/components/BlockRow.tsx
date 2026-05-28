import { ArrowRight, Check, Circle, Clipboard, Globe2, Minus } from "lucide-react";
import type { BlockStatus, TextBlock } from "../types";
import { firstLine, secondLine } from "../utils/text";
import { typeLabels } from "./blockLabels";
import { TranslationPopover } from "./TranslationPopover";

export function BlockRow({
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

function statusIcon(status: BlockStatus, isCurrent: boolean) {
  if (isCurrent) return <ArrowRight size={16} />;
  if (status === "completed") return <Check size={16} />;
  if (status === "skipped") return <Minus size={16} />;
  return <Circle size={15} />;
}
