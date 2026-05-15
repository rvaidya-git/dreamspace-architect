const DECOR = [
  { emoji: '🛏️', top: '8%',  left: '5%',  rotate: '-12deg' },
  { emoji: '🪴', top: '15%', right: '7%', rotate: '8deg'   },
  { emoji: '💡', top: '60%', left: '4%',  rotate: '5deg'   },
  { emoji: '📚', bottom: '10%', left: '10%', rotate: '-8deg' },
  { emoji: '🛋️', bottom: '12%', right: '5%', rotate: '10deg' },
  { emoji: '🪟', top: '40%', right: '4%',  rotate: '-6deg' },
  { emoji: '🟫', top: '72%', left: '14%',  rotate: '4deg'  },
  { emoji: '🌿', bottom: '22%', right: '12%', rotate: '-5deg' },
];

export default function StartScreen({ onStart }) {
  return (
    <div className="start-screen">
      {/* Floating room item decorations */}
      <div className="start-decor" aria-hidden="true">
        {DECOR.map((d, i) => (
          <span
            key={i}
            className="start-decor-item"
            style={{
              top: d.top,
              left: d.left,
              right: d.right,
              bottom: d.bottom,
              transform: `rotate(${d.rotate})`,
            }}
          >
            {d.emoji}
          </span>
        ))}
      </div>

      <div className="start-card">
        <div className="start-logo">🏠</div>
        <h1 className="start-title">DreamSpace Architect</h1>
        <p className="start-tagline">Design amazing rooms for your clients!</p>

        <div className="start-features">
          <span className="start-feature-pill">🎨 Place furniture</span>
          <span className="start-feature-pill">💰 Spend your budget</span>
          <span className="start-feature-pill">⭐ Earn stars</span>
        </div>

        <button className="btn-primary" onClick={onStart}>
          Choose a Mission! 🗺️
        </button>
      </div>
    </div>
  );
}
