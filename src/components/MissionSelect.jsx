import { MISSIONS } from '../data/missions';

const DIFF_LABEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const DIFF_STARS = { 1: '★☆☆', 2: '★★☆', 3: '★★★' };

export default function MissionSelect({ onPick, onBack, inProgressIds = new Set() }) {
  return (
    <div className="mission-select">
      <div className="mission-select-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h1 className="mission-select-title">Choose Your Mission</h1>
        <p className="mission-select-sub">Pick a room to design for your client!</p>
      </div>

      <div className="mission-grid">
        {MISSIONS.map((m) => {
          const isInProgress = inProgressIds.has(m.id);
          return (
            <button
              key={m.id}
              className={`mission-card${isInProgress ? ' mission-card--in-progress' : ''}`}
              style={{ '--card-color': m.color }}
              onClick={() => onPick(m)}
            >
              <div className="mission-card-icon">{m.themeEmoji}</div>
              <div className="mission-card-body">
                {isInProgress && (
                  <div className="mission-card-progress-badge">✏️ In Progress</div>
                )}
                <div className="mission-card-title">{m.title}</div>
                <div className="mission-card-client">
                  {m.clientEmoji} {m.client}
                </div>
                <div className="mission-card-tagline">{m.tagline}</div>
                <div className="mission-card-footer">
                  <span className="mission-card-budget">💰 ${m.budget}</span>
                  <span className={`mission-card-diff diff-${m.difficulty}`}>
                    {DIFF_STARS[m.difficulty]} {DIFF_LABEL[m.difficulty]}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
