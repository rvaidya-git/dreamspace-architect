export default function StartScreen({ onStart }) {
  return (
    <div className="start-screen">
      <div className="start-content">
        <div className="start-logo">🏠</div>
        <h1 className="start-title">DreamSpace Architect</h1>
        <p className="start-tagline">Design amazing rooms for your clients!</p>
        <div className="start-features">
          <span>🎨 Place furniture</span>
          <span>💰 Manage your budget</span>
          <span>⭐ Earn stars</span>
        </div>
        <button className="btn-primary" onClick={onStart}>
          Start Mission!
        </button>
      </div>
    </div>
  );
}
