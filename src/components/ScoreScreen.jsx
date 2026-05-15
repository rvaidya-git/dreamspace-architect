const STAR_LABEL = { 1: 'Nice Try!', 2: 'Good Job!', 3: 'Amazing!' };
const STAR_DISPLAY = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' };

export default function ScoreScreen({ score, onPlayAgain }) {
  const { total, stars, breakdown } = score;

  return (
    <div className="score-screen">
      <div className="score-card">
        <div className="score-stars">{STAR_DISPLAY[stars]}</div>
        <h2 className="score-title">{STAR_LABEL[stars]}</h2>
        <p className="score-total">Score: {total} / 100</p>

        <div className="score-breakdown">
          {breakdown.map((cat) => (
            <div key={cat.label} className="score-category">
              <div className="score-cat-header">
                <span className="score-cat-label">{cat.label}</span>
                <span className="score-cat-pts">{cat.earned}/{cat.max}</span>
              </div>
              <div className="score-bar-track">
                <div
                  className="score-bar-fill"
                  style={{ width: `${(cat.earned / cat.max) * 100}%` }}
                />
              </div>
              {cat.goalResults && (
                <ul className="goal-list">
                  {cat.goalResults.map((g) => (
                    <li key={g.id} className={`goal-item${g.passed ? ' goal-passed' : ' goal-failed'}`}>
                      {g.passed ? '✅' : '❌'} {g.label}
                    </li>
                  ))}
                </ul>
              )}
              <p className="score-tip">{cat.tip}</p>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onPlayAgain}>
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}
