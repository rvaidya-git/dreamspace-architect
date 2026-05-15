import { useState, useEffect } from 'react';
import { MISSIONS } from '../data/missions';
import { getScores, deleteAccount } from '../utils/db';

const STAR_DISPLAY = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' };

function starsForScore(score) {
  if (score >= 70) return 3;
  if (score >= 40) return 2;
  return 1;
}

const MISSION_MAP = Object.fromEntries(MISSIONS.map(m => [m.id, m]));

export default function ProfilePage({ profile, onBack, onSignOut }) {
  const [scores, setScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    getScores(profile.id).then(data => {
      setScores(data);
      setLoadingScores(false);
    });
  }, [profile.id]);

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount(profile.id);
      onSignOut();
    } catch (e) {
      setDeleteError(e.message || 'Delete failed. Please try again.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="profile-screen">
      <div className="profile-card">
        <button className="profile-back-btn" onClick={onBack}>← Back</button>

        <div className="profile-header">
          <span className="profile-avatar">🏗️</span>
          <div>
            <h2 className="profile-username">{profile.username}</h2>
            <p className="profile-total-score">Total score: {totalScore} pts</p>
          </div>
        </div>

        <h3 className="profile-section-title">Completed Missions</h3>

        {loadingScores ? (
          <p className="profile-empty">Loading…</p>
        ) : scores.length === 0 ? (
          <p className="profile-empty">No missions completed yet — go design something! 🎨</p>
        ) : (
          <div className="profile-mission-list">
            {scores.map(s => {
              const mission = MISSION_MAP[s.mission_id];
              const stars = starsForScore(s.score);
              return (
                <div key={s.mission_id} className="profile-mission-row">
                  <span className="profile-mission-emoji">{mission?.themeEmoji ?? '🏠'}</span>
                  <span className="profile-mission-name">{mission?.title ?? s.mission_id}</span>
                  <span className="profile-mission-stars">{STAR_DISPLAY[stars]}</span>
                  <span className="profile-mission-score">{s.score} pts</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="profile-actions">
          <button className="btn-secondary profile-signout-btn" onClick={onSignOut}>
            🚪 Sign Out
          </button>

          {!confirmDelete ? (
            <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
              🗑️ Delete Profile
            </button>
          ) : (
            <div className="confirm-delete">
              <p>This will delete your username <strong>{profile.username}</strong> and all your scores forever. You can't undo this!</p>
              {deleteError && <p className="confirm-delete-error">{deleteError}</p>}
              <div className="confirm-delete-btns">
                <button className="btn-secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Yes, delete everything'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
