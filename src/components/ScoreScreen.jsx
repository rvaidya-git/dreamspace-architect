const STAR_LABEL   = { 1: 'Nice Try! 🌱', 2: 'Good Job! 🎉', 3: 'Amazing! 🏆' };
const STAR_DISPLAY = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' };

const CAT_COLOR = {
  'Mission Goals': '#E8721A',
  'Budget':        '#2EAA60',
  'Walking Space': '#3498DB',
  'Lighting':      '#E8C020',
  'Coziness':      '#D45090',
};

export default function ScoreScreen({ score, onPlayAgain, onChangeMission }) {
  const { total, stars, breakdown } = score;

  return (
    <div className="score-screen">
      <div className="score-card">
        <span className="score-stars">{STAR_DISPLAY[stars]}</span>
        <h2 className="score-title">{STAR_LABEL[stars]}</h2>
        <p className="score-total">Score: {total} / 100</p>

        <div className="score-breakdown">
          {breakdown.map((cat) => {
            const barColor = CAT_COLOR[cat.label] ?? 'var(--accent)';
            const pct = cat.max > 0 ? (cat.earned / cat.max) * 100 : 0;
            const isFull = cat.earned >= cat.max;

            return (
              <div key={cat.label} className="score-category">
                <div className="score-cat-header">
                  <span className="score-cat-label">{cat.label}</span>
                  <span className="score-cat-pts" style={{ color: barColor }}>
                    {cat.earned}/{cat.max}
                  </span>
                </div>

                <div className="score-bar-track">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${pct}%`, background: barColor }}
                  />
                </div>

                {cat.goalResults && (
                  <ul className="goal-list">
                    {cat.goalResults.map((g) => (
                      <li
                        key={g.id}
                        className={`goal-item ${g.passed ? 'goal-passed' : 'goal-failed'}`}
                      >
                        {g.passed ? '✅' : '❌'} {g.label}
                      </li>
                    ))}
                  </ul>
                )}

                {cat.praise && (
                  <p className={`score-praise${isFull ? ' score-praise--full' : ''}`}>
                    {cat.praise}
                  </p>
                )}
                {cat.suggestion && !isFull && (
                  <p className="score-suggestion">
                    💡 {cat.suggestion}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="score-actions">
          <button className="btn-primary" onClick={onPlayAgain}>
            🔄 Play Again
          </button>
          <button className="btn-secondary" onClick={onChangeMission}>
            🗺️ Try Another Mission
          </button>
        </div>
      </div>
    </div>
  );
}
