import { t } from "../services/i18n";
import { useCopyDeckStore } from "../store/useCopyDeckStore";

export function ProgressSection({
  completed,
  total,
  progress
}: {
  completed: number;
  total: number;
  progress: number;
}) {
  const interfaceLanguage = useCopyDeckStore((state) => state.interfaceLanguage);

  return (
    <section className="progress-section">
      <div className="progress-meta">
        <span>
          {completed} / {total} {t(interfaceLanguage, "blocks")}
        </span>
        <div className="progress-track">
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
        <strong>{progress}%</strong>
      </div>
    </section>
  );
}
