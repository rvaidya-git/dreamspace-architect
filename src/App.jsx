import { useState } from 'react';
import { MISSIONS } from './data/missions';
import { ITEMS } from './data/items';
import { scoreRoom } from './utils/scoring';
import StartScreen from './components/StartScreen';
import DesignRoom from './components/DesignRoom';
import ScoreScreen from './components/ScoreScreen';
import './App.css';

let uidCounter = 1;
function makeUid() {
  return String(uidCounter++);
}

const mission = MISSIONS[0];

export default function App() {
  const [gamePhase, setGamePhase] = useState('start'); // 'start' | 'design' | 'score'
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [score, setScore] = useState(null);

  function handleStart() {
    setPlacedItems([]);
    setSelectedItemId(null);
    setScore(null);
    setGamePhase('design');
  }

  function handlePlace(itemId, x, y) {
    const item = ITEMS[itemId];
    const spent = placedItems.reduce((s, p) => s + ITEMS[p.itemId].cost, 0);
    if (spent + item.cost > mission.budget) return; // safety guard
    setPlacedItems((prev) => [...prev, { uid: makeUid(), itemId, x, y }]);
  }

  function handleRemove(uid) {
    setPlacedItems((prev) => prev.filter((p) => p.uid !== uid));
  }

  function handleSubmit() {
    setScore(scoreRoom(placedItems, mission));
    setGamePhase('score');
  }

  return (
    <div className="app">
      {gamePhase === 'start' && <StartScreen onStart={handleStart} />}

      {gamePhase === 'design' && (
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
        <ScoreScreen score={score} onPlayAgain={handleStart} />
      )}
    </div>
  );
}
