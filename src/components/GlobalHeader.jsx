export default function GlobalHeader({ userProfile, onHome, onLeaderboard, onProfile, onSignOut }) {
  return (
    <header className="global-header">
      <div className="gh-left">
        <button className="gh-btn gh-home" onClick={onHome}>🏠 Home</button>
        <button className="gh-btn gh-leaderboard" onClick={onLeaderboard}>🏆 Leaderboard</button>
      </div>
      {userProfile && (
        <div className="gh-right">
          <button className="gh-btn gh-profile" onClick={onProfile}>
            👤 {userProfile.username}
          </button>
          <button className="gh-btn gh-signout" onClick={onSignOut}>Sign Out</button>
        </div>
      )}
    </header>
  );
}
