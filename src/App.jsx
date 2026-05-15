import { useState, useEffect, useRef } from 'react';
import { ITEMS } from './data/items';
import { MISSIONS } from './data/missions';
import { scoreRoom } from './utils/scoring';
import * as db from './utils/db';
import AuthScreen from './components/AuthScreen';
import ResumeScreen from './components/ResumeScreen';
import StartScreen from './components/StartScreen';
import MissionSelect from './components/MissionSelect';
import DesignRoom from './components/DesignRoom';
import ScoreScreen from './components/ScoreScreen';
import ProfilePage from './components/ProfilePage';
import Leaderboard from './components/Leaderboard';
import GlobalHeader from './components/GlobalHeader';
import './App.css';

let uidCounter = 1;
function makeUid() { return String(uidCounter++); }

export default function App() {
  // ── Auth state ────────────────────────────────────
  const [userProfile, setUserProfile] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // ── Game state ────────────────────────────────────
  const [gamePhase, setGamePhase] = useState('loading');
  const [mission, setMission] = useState(null);
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [score, setScore] = useState(null);
  const [inProgressMissions, setInProgressMissions] = useState([]);
  const [showAnonHomeWarning, setShowAnonHomeWarning] = useState(false);

  const phaseBeforeProfile     = useRef(null);
  const phaseBeforeLeaderboard = useRef(null);
  const saveTimer              = useRef(null);

  // ── Auth initialization ───────────────────────────
  useEffect(() => {
    async function init() {
      const playerId = db.getStoredPlayerId();
      if (!playerId) { setGamePhase('auth'); return; }
      try {
        const profile = await db.loadProfile(playerId);
        if (!profile) { db.clearStoredPlayerId(); setGamePhase('auth'); return; }
        setUserProfile(profile);
        setIsAnonymous(false);
        const progressList = (await db.loadAllProgress(profile.id))
          .filter(p => p.placed_items?.length > 0);
        if (progressList.length > 0) {
          setInProgressMissions(progressList);
          setGamePhase('resume');
        } else {
          setGamePhase('start');
        }
      } catch {
        setGamePhase('auth');
      }
    }
    init();
  }, []);

  // ── Post-auth routing ─────────────────────────────
  async function handleAuthenticated(profile) {
    setUserProfile(profile);
    setIsAnonymous(false);
    try {
      const progressList = (await db.loadAllProgress(profile.id))
        .filter(p => p.placed_items?.length > 0);
      if (progressList.length > 0) {
        setInProgressMissions(progressList);
        setGamePhase('resume');
      } else {
        setGamePhase('start');
      }
    } catch {
      setGamePhase('start');
    }
  }

  // ── Progress save helpers ─────────────────────────
  function scheduleSave(missionId, items) {
    if (isAnonymous || !userProfile) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      db.saveProgress(userProfile.id, missionId, items);
    }, 400);
  }

  // ── Navigation ────────────────────────────────────
  function navigateHome() {
    setMission(null);
    setPlacedItems([]);
    setScore(null);
    setSelectedItemId(null);
    setShowAnonHomeWarning(false);
    setGamePhase('start');
  }

  function handleGoHome() {
    // Warn anonymous users mid-design — they'll lose unsaved work
    if (isAnonymous && gamePhase === 'design' && placedItems.length > 0) {
      setShowAnonHomeWarning(true);
      return;
    }
    navigateHome();
  }

  function handleGoToProfile() {
    if (gamePhase === 'profile') return;
    phaseBeforeProfile.current = gamePhase;
    setGamePhase('profile');
  }

  function handleBackFromProfile() {
    setGamePhase(phaseBeforeProfile.current || 'start');
  }

  function handleGoToLeaderboard() {
    if (gamePhase === 'leaderboard') return;
    phaseBeforeLeaderboard.current = gamePhase;
    setGamePhase('leaderboard');
  }

  function handleBackFromLeaderboard() {
    setGamePhase(phaseBeforeLeaderboard.current || 'start');
  }

  function handleGoToAuth() {
    setIsAnonymous(false);
    setMission(null);
    setPlacedItems([]);
    setScore(null);
    setSelectedItemId(null);
    setGamePhase('auth');
  }

  function handleSignOut() {
    db.signOut();
    setUserProfile(null);
    setIsAnonymous(false);
    setMission(null);
    setPlacedItems([]);
    setScore(null);
    setGamePhase('auth');
  }

  // ── Game handlers ─────────────────────────────────
  function handleResumeMission(missionId, savedItems) {
    const m = MISSIONS.find(ms => ms.id === missionId);
    if (!m) return;
    setMission(m);
    setPlacedItems(savedItems.map(item => ({ ...item, uid: makeUid() })));
    setSelectedItemId(null);
    setScore(null);
    setGamePhase('design');
  }

  async function handlePickMission(m) {
    let initial = [];
    if (!isAnonymous && userProfile) {
      try {
        const saved = await db.loadProgress(userProfile.id, m.id);
        if (saved && saved.length > 0) {
          initial = saved.map(item => ({ ...item, uid: makeUid() }));
        }
      } catch { /* start fresh */ }
    }
    setMission(m);
    setPlacedItems(initial);
    setSelectedItemId(null);
    setScore(null);
    setGamePhase('design');
  }

  function handlePlace(itemId, x, y, rotated) {
    if (!mission) return;
    const item = ITEMS[itemId];
    const spent = placedItems.reduce((s, p) => s + ITEMS[p.itemId].cost, 0);
    if (spent + item.cost > mission.budget) return;
    const next = [...placedItems, { uid: makeUid(), itemId, x, y, rotated: !!rotated }];
    setPlacedItems(next);
    scheduleSave(mission.id, next);
  }

  function handleRemove(uid) {
    const next = placedItems.filter(p => p.uid !== uid);
    setPlacedItems(next);
    scheduleSave(mission.id, next);
  }

  async function handleSubmit() {
    const computed = scoreRoom(placedItems, mission);
    setScore(computed);
    setGamePhase('score');
    if (!isAnonymous && userProfile) {
      try {
        await db.submitMission(userProfile.id, mission.id, computed.total);
      } catch (e) {
        console.error('Score save failed:', e.message);
      }
    }
  }

  function handlePlayAgain() {
    setPlacedItems([]);
    setSelectedItemId(null);
    setScore(null);
    setGamePhase('design');
  }

  function handleChangeMission() {
    setMission(null);
    setGamePhase('pick');
  }

  // ── Render ────────────────────────────────────────
  const HIDE_HEADER = new Set(['loading', 'auth']);

  return (
    <div className="app">

      {/* Global nav — hidden on loading/auth screens */}
      {!HIDE_HEADER.has(gamePhase) && (
        <GlobalHeader
          userProfile={userProfile}
          onHome={handleGoHome}
          onLeaderboard={handleGoToLeaderboard}
          onProfile={handleGoToProfile}
          onSignOut={handleSignOut}
          onGoToAuth={handleGoToAuth}
        />
      )}

      {/* Anonymous mid-design home-navigation warning */}
      {showAnonHomeWarning && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">⚠️</div>
            <h3 className="modal-title">Heads up!</h3>
            <p className="modal-body">
              Anonymous play doesn't save. Going home will lose your current room design.
            </p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowAnonHomeWarning(false)}>
                Keep Playing
              </button>
              <button className="btn-ghost" onClick={navigateHome}>
                Go Home Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {gamePhase === 'loading' && (
        <div className="app-loading">
          <span className="app-loading-emoji">🏗️</span>
          <p className="app-loading-text">Loading…</p>
        </div>
      )}

      {gamePhase === 'auth' && (
        <AuthScreen
          onAnonymous={() => { setIsAnonymous(true); setGamePhase('start'); }}
          onProfileCreated={handleAuthenticated}
          onLogin={handleAuthenticated}
          onLeaderboard={() => {
            phaseBeforeLeaderboard.current = 'auth';
            setGamePhase('leaderboard');
          }}
        />
      )}

      {gamePhase === 'resume' && (
        <ResumeScreen
          progressList={inProgressMissions}
          onResume={handleResumeMission}
          onBrowse={() => setGamePhase('pick')}
        />
      )}

      {gamePhase === 'start' && (
        <StartScreen onStart={() => setGamePhase('pick')} />
      )}

      {gamePhase === 'pick' && (
        <MissionSelect
          onPick={handlePickMission}
          onBack={() => setGamePhase('start')}
          inProgressIds={new Set(inProgressMissions.map(p => p.mission_id))}
        />
      )}

      {gamePhase === 'design' && mission && (
        <DesignRoom
          mission={mission}
          placedItems={placedItems}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
          onPlace={handlePlace}
          onRemove={handleRemove}
          onSubmit={handleSubmit}
        />
      )}

      {gamePhase === 'score' && score && (
        <ScoreScreen
          score={score}
          onPlayAgain={handlePlayAgain}
          onChangeMission={handleChangeMission}
        />
      )}

      {gamePhase === 'profile' && userProfile && (
        <ProfilePage
          profile={userProfile}
          onBack={handleBackFromProfile}
          onSignOut={handleSignOut}
        />
      )}

      {gamePhase === 'leaderboard' && (
        <Leaderboard
          userProfile={userProfile}
          onBack={handleBackFromLeaderboard}
        />
      )}

    </div>
  );
}
