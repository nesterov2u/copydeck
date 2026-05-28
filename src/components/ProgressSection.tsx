import { ListChecks } from "lucide-react";

export function ProgressSection({
  completed,
  total,
  progress
}: {
  completed: number;
  total: number;
  progress: number;
}) {
  return (
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
  );
}
