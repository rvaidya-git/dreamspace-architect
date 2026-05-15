export default function UserBar({ username, onSignOut }) {
  return (
    <div className="user-bar">
      <span className="user-bar-name">👤 {username}</span>
      <button className="user-bar-signout" onClick={onSignOut}>
        Sign Out
      </button>
    </div>
  );
}
