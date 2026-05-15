export default function BudgetTracker({ spent, total }) {
  const remaining = total - spent;
  const pct = Math.min((spent / total) * 100, 100);
  const isWarning = pct > 75;
  const isDanger = pct > 95;

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
        <span className={isDanger ? 'budget-over' : ''}>${remaining} left</span>
        <span className="budget-slash"> / </span>
        <span className="budget-total">${total}</span>
      </div>
    </div>
  );
}
