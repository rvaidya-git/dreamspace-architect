export default function BudgetTracker({ spent, total }) {
  const remaining = total - spent;
  const pct = Math.min((spent / total) * 100, 100);
  const isWarning = pct > 72;
  const isDanger = pct > 93;

  return (
    <div className="budget-tracker">
      <div className="budget-label">💰 Budget</div>
      <div className="budget-bar-wrapper">
        <div
          className={`budget-bar${isWarning ? ' budget-bar--warning' : ''}${isDanger ? ' budget-bar--danger' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="budget-numbers">
        <span className={`budget-remaining${isDanger ? ' budget-remaining--danger' : ''}`}>
          ${remaining}
        </span>
        <span className="budget-sep"> remaining /</span>
        <span className="budget-total"> ${total}</span>
      </div>
    </div>
  );
}
