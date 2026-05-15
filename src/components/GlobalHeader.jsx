export default function GlobalHeader({ userProfile, onHome, onLeaderboard, onProfile, onSignOut, onGoToAuth }) {
  return (
    <header className="global-header">
      <div className="gh-left">
        <button className="gh-btn gh-home" onClick={onHome}>🏠 Home</button>
        <button className="gh-btn gh-leaderboard" onClick={onLeaderboard}>🏆 Leaderboard</button>
      </div>
      <div className="gh-right">
        {userProfile ? (
          <>
            <button className="gh-btn gh-profile" onClick={onProfile} title={userProfile.username}>
              👤 {userProfile.username}
            </button>
            <button className="gh-btn gh-signout" onClick={onSignOut}>Sign Out</button>
          </>
        ) : (
          <button className="gh-btn gh-signup" onClick={onGoToAuth}>✨ Sign Up / Log In</button>
        )}
      </div>
    </header>
  );
}
