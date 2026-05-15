import { useState, useEffect, useMemo } from 'react';
import { ITEMS } from '../data/items';
import { computeWalkOverlay, computeLightOverlay, computeCrowdOverlay } from '../utils/overlays';
import BudgetTracker from './BudgetTracker';
import ItemPalette from './ItemPalette';
import RoomGrid from './RoomGrid';

export default function DesignRoom({
  mission,
  placedItems,
  selectedItemId,
  onSelectItem,
  onPlace,
  onRemove,
  onSubmit,
  userProfile,
  onProfile,
}) {
  const [rotated, setRotated] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null); // null | 'walk' | 'light' | 'crowd'

  // Reset rotation whenever the player picks a different item
  useEffect(() => {
    setRotated(false);
  }, [selectedItemId]);

  // Exit erase mode whenever an item is selected from the palette
  useEffect(() => {
    if (selectedItemId) setEraseMode(false);
  }, [selectedItemId]);

  const spent = placedItems.reduce((sum, p) => sum + ITEMS[p.itemId].cost, 0);
  const remaining = mission.budget - spent;

  const selectedItem = selectedItemId ? ITEMS[selectedItemId] : null;
  const canAffordSelected = selectedItem ? selectedItem.cost <= remaining : false;

  // Compute the active overlay (memoized so it only recalculates when inputs change)
  const overlayData = useMemo(() => {
    const { gridCols, gridRows } = mission;
    if (activeOverlay === 'walk')  return computeWalkOverlay(placedItems, gridCols, gridRows);
    if (activeOverlay === 'light') return computeLightOverlay(placedItems, gridCols, gridRows);
    if (activeOverlay === 'crowd') return computeCrowdOverlay(placedItems, gridCols, gridRows);
    return null;
  }, [activeOverlay, placedItems, mission]);

  // Effective dimensions after rotation
  const [bw, bh] = selectedItem ? selectedItem.size : [1, 1];
  const [ew, eh] = rotated ? [bh, bw] : [bw, bh];
  // Rotation only does something on rectangular (non-square) items
  const canRotate = selectedItem != null && bw !== bh;

  function toggleErase() {
    const entering = !eraseMode;
    if (entering) onSelectItem(null); // deselect any item before entering erase mode
    setEraseMode(entering);
  }

  // Hint text reacts to current mode
  let hint;
  if (eraseMode) {
    hint = '🗑️ Erase mode: click any item in the room to remove it. Click "Done" when finished.';
  } else if (!selectedItemId) {
    hint = 'Pick an item from the left, then click the room to place it.';
  } else if (!canAffordSelected) {
    hint = `⚠️ Not enough budget for ${selectedItem.name} ($${selectedItem.cost}).`;
  } else {
    hint = `Placing ${selectedItem.emoji} ${selectedItem.name} (${ew}×${eh}) — click the room to place it.`;
  }

  return (
    <div className="design-room">
      <header className="design-header">
        <div className="client-bubble">
          <div className="client-avatar">{mission.clientEmoji}</div>
          <div className="client-speech">
            <div className="client-speech-name">{mission.client}&apos;s Wishlist</div>
            <div className="client-speech-text">{mission.brief}</div>
          </div>
        </div>

        <BudgetTracker spent={spent} total={mission.budget} />

        <div className="header-right">
          {userProfile && (
            <button className="btn-profile" onClick={onProfile} title="My Profile">
              👤 {userProfile.username}
            </button>
          )}
          <button className="btn-primary btn-submit" onClick={onSubmit}>
            Submit Design ✓
          </button>
        </div>
      </header>

      <div className="design-body">
        <aside className="design-sidebar">
          <ItemPalette
            selectedItemId={selectedItemId}
            onSelect={onSelectItem}
            budget={remaining}
          />
        </aside>

        <main className="design-main">
          <div className="grid-area">
            <div className="grid-label">{mission.title}</div>
            <div className="grid-hint">{hint}</div>

            {/* Editing toolbar */}
            <div className="edit-toolbar">
              <button
                className={`toolbar-btn${eraseMode ? ' toolbar-btn--erase' : ''}`}
                onClick={toggleErase}
                title="Click items in the room to remove them"
              >
                {eraseMode ? '✅ Done Erasing' : '🗑️ Erase Item'}
              </button>

              <button
                className={`toolbar-btn${rotated ? ' toolbar-btn--active' : ''}`}
                onClick={() => setRotated((r) => !r)}
                disabled={!canRotate}
                title={
                  !selectedItem
                    ? 'Select an item first to rotate it'
                    : !canRotate
                    ? 'Square items look the same when rotated'
                    : `Rotate — currently ${ew}×${eh}`
                }
              >
                🔄 Rotate
                {canRotate && (
                  <span className="toolbar-dims">{ew}×{eh}</span>
                )}
              </button>

              <div className="toolbar-sep" />

              <button
                className={`toolbar-btn toolbar-btn--vision${activeOverlay === 'walk' ? ' toolbar-btn--vision-active' : ''}`}
                onClick={() => setActiveOverlay((v) => v === 'walk' ? null : 'walk')}
                title="Show which areas you can walk through"
              >
                🚶 Walking Path
              </button>

              <button
                className={`toolbar-btn toolbar-btn--vision${activeOverlay === 'light' ? ' toolbar-btn--vision-active' : ''}`}
                onClick={() => setActiveOverlay((v) => v === 'light' ? null : 'light')}
                title="Show how much light reaches each area"
              >
                ☀️ Light Zones
              </button>

              <button
                className={`toolbar-btn toolbar-btn--vision${activeOverlay === 'crowd' ? ' toolbar-btn--vision-active' : ''}`}
                onClick={() => setActiveOverlay((v) => v === 'crowd' ? null : 'crowd')}
                title="Show which areas feel crowded or open"
              >
                📦 Crowding
              </button>
            </div>

            {/* Vision legend */}
            {activeOverlay === 'walk' && (
              <div className="vision-legend">
                <div className="vision-legend-title">🚶 Walking Path — can people move around easily?</div>
                <div className="vision-legend-items">
                  <span className="legend-chip legend-chip--free">🟢 Free to walk</span>
                  <span className="legend-chip legend-chip--blocked">🔴 Blocked by furniture</span>
                </div>
              </div>
            )}
            {activeOverlay === 'light' && (
              <div className="vision-legend">
                <div className="vision-legend-title">☀️ Light Zones — how bright is each spot?</div>
                <div className="vision-legend-items">
                  <span className="legend-chip legend-chip--bright">🌟 Bright</span>
                  <span className="legend-chip legend-chip--dim">🌤️ Dim</span>
                  <span className="legend-chip legend-chip--dark">🌑 Dark</span>
                </div>
              </div>
            )}
            {activeOverlay === 'crowd' && (
              <div className="vision-legend">
                <div className="vision-legend-title">📦 Crowding — does the room feel open or packed?</div>
                <div className="vision-legend-items">
                  <span className="legend-chip legend-chip--open">😌 Open &amp; airy</span>
                  <span className="legend-chip legend-chip--cozy">🏠 Cozy</span>
                  <span className="legend-chip legend-chip--crowded">😬 Crowded</span>
                </div>
              </div>
            )}

            <RoomGrid
              mission={mission}
              placedItems={placedItems}
              selectedItemId={selectedItemId}
              canAffordSelected={canAffordSelected}
              rotated={rotated}
              eraseMode={eraseMode}
              overlayData={overlayData}
              onPlace={onPlace}
              onRemove={onRemove}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
