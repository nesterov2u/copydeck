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
        <span>{completed} / {total} Blocks</span>
        <div className="progress-track">
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
        <strong>{progress}%</strong>
      </div>
    </section>
  );
}
