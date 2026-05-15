import { useState, useEffect } from 'react';
import * as db from '../utils/db';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

// Standard competition ranking: 1, 2, 2, 4 (not 1, 2, 2, 3)
function computeRanks(entries) {
  let rank = 1;
  return entries.map((entry, i) => {
    if (i > 0 && entry.total_score < entries[i - 1].total_score) {
      rank = i + 1;
    }
    return { ...entry, rank };
  });
}

export default function Leaderboard({ userProfile, onBack }) {
  const [entries, setEntries] = useState([]);
  const [myRankData, setMyRankData] = useState(null); // set when user is outside top list
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const raw = await db.getLeaderboard();
        const ranked = computeRanks(raw);
        setEntries(ranked);

        if (userProfile) {
          const inList = ranked.some(e => e.id === userProfile.id);
          if (!inList) {
            const data = await db.getUserRankAndScore(userProfile.id);
            if (data) setMyRankData(data);
          }
        }
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userProfile]);

  return (
    <div className="leaderboard-screen">
      <div className="leaderboard-card">

        <div className="leaderboard-header">
          <button className="leaderboard-back-btn" onClick={onBack}>← Back</button>
          <div className="leaderboard-trophy">🏆</div>
          <h1 className="leaderboard-title">Leaderboard</h1>
          <p className="leaderboard-sub">Top designers from around the world!</p>
        </div>

        {loading && (
          <p className="leaderboard-state">Loading scores…</p>
        )}

        {!loading && loadError && (
          <p className="leaderboard-state">Couldn't load scores. Try again later!</p>
        )}

        {!loading && !loadError && entries.length === 0 && (
          <p className="leaderboard-state">
            No scores yet — be the first to complete a mission! 🎨
          </p>
        )}

        {!loading && !loadError && entries.length > 0 && (
          <div className="lb-list">
            {entries.map((entry) => {
              const isMe = userProfile?.id === entry.id;
              const medal = MEDAL[entry.rank];

              return (
                <div
                  key={entry.id}
                  className={[
                    'lb-row',
                    medal    ? `lb-row--rank${entry.rank}` : '',
                    isMe     ? 'lb-row--me' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div className="lb-rank-cell">
                    {medal
                      ? <span className="lb-medal">{medal}</span>
                      : <span className="lb-rank-num">#{entry.rank}</span>
                    }
                  </div>

                  <div className="lb-name">
                    <span className="lb-username">{entry.username_display}</span>
                    {isMe && <span className="lb-you-tag">you!</span>}
                  </div>

                  <div className="lb-score">{entry.total_score} pts</div>
                </div>
              );
            })}
          </div>
        )}

        {myRankData && (
          <div className="lb-outside-rank">
            You're ranked <strong>#{myRankData.rank}</strong> with{' '}
            <strong>{myRankData.score} pts</strong> — keep designing! 🎨
          </div>
        )}

      </div>
    </div>
  );
}
