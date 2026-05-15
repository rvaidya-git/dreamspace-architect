import { useState } from 'react';
import { ITEMS } from './data/items';
import { scoreRoom } from './utils/scoring';
import StartScreen from './components/StartScreen';
import MissionSelect from './components/MissionSelect';
import DesignRoom from './components/DesignRoom';
import ScoreScreen from './components/ScoreScreen';
import './App.css';

let uidCounter = 1;
function makeUid() {
  return String(uidCounter++);
}

export default function App() {
  const [gamePhase, setGamePhase] = useState('start'); // 'start' | 'pick' | 'design' | 'score'
  const [mission, setMission] = useState(null);
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [score, setScore] = useState(null);

  function handleGoToPick() {
    setGamePhase('pick');
  }

  function handlePickMission(m) {
    setMission(m);
    setPlacedItems([]);
    setSelectedItemId(null);
    setScore(null);
    setGamePhase('design');
  }

  function handlePlace(itemId, x, y) {
    if (!mission) return;
    const item = ITEMS[itemId];
    const spent = placedItems.reduce((s, p) => s + ITEMS[p.itemId].cost, 0);
    if (spent + item.cost > mission.budget) return;
    setPlacedItems((prev) => [...prev, { uid: makeUid(), itemId, x, y }]);
  }

  function handleRemove(uid) {
    setPlacedItems((prev) => prev.filter((p) => p.uid !== uid));
  }

  function handleSubmit() {
    setScore(scoreRoom(placedItems, mission));
    setGamePhase('score');
  }

  // Replay the same mission from scratch
  function handlePlayAgain() {
    setPlacedItems([]);
    setSelectedItemId(null);
    setScore(null);
    setGamePhase('design');
  }

  // Go back to mission picker
  function handleChangeMission() {
    setGamePhase('pick');
  }

  return (
    <div className="app">
      {gamePhase === 'start' && <StartScreen onStart={handleGoToPick} />}

      {gamePhase === 'pick' && (
        <MissionSelect onPick={handlePickMission} onBack={() => setGamePhase('start')} />
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
    </div>
  );
}
