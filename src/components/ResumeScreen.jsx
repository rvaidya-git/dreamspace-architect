import { MISSIONS } from '../data/missions';

const MISSION_MAP = Object.fromEntries(MISSIONS.map(m => [m.id, m]));

export default function ResumeScreen({ progressList, onResume, onBrowse }) {
  const count = progressList.length;

  return (
    <div className="resume-screen">
      <div className="resume-card">
        <div className="resume-icon">🔖</div>
        <h2 className="resume-title">Continue where you left off?</h2>
        <p className="resume-subtitle">
          {count === 1
            ? 'You have an unfinished mission!'
            : `You have ${count} unfinished missions!`}
        </p>

        <div className="resume-list">
          {progressList.map(p => {
            const mission = MISSION_MAP[p.mission_id];
            if (!mission) return null;
            const itemCount = p.placed_items?.length ?? 0;
            return (
              <div key={p.mission_id} className="resume-row">
                <div className="resume-row-info">
                  <span className="resume-row-emoji">{mission.themeEmoji}</span>
                  <div className="resume-row-text">
                    <div className="resume-row-name">{mission.title}</div>
                    <div className="resume-row-meta">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} placed
                    </div>
                  </div>
                </div>
                <button
                  className="btn-primary resume-resume-btn"
                  onClick={() => onResume(p.mission_id, p.placed_items)}
                >
                  Resume →
                </button>
              </div>
            );
          })}
        </div>

        <button className="btn-ghost resume-browse-btn" onClick={onBrowse}>
          🗺️ Browse All Missions Instead
        </button>
      </div>
    </div>
  );
}
