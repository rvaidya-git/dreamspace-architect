import { useState } from 'react';
import { ITEMS } from '../data/items';

const CELL = 60; // px per grid cell

const CATEGORY_COLOR = {
  sleep:   'var(--c-sleep)',
  work:    'var(--c-work)',
  light:   'var(--c-light)',
  plant:   'var(--c-plant)',
  comfort: 'var(--c-comfort)',
  storage: 'var(--c-storage)',
  window:  'var(--c-window)',
};

const CATEGORY_BORDER = {
  sleep:   'var(--cb-sleep)',
  work:    'var(--cb-work)',
  light:   'var(--cb-light)',
  plant:   'var(--cb-plant)',
  comfort: 'var(--cb-comfort)',
  storage: 'var(--cb-storage)',
  window:  'var(--cb-window)',
};

function buildOccupancy(placedItems) {
  const map = new Map(); // "x,y" -> uid
  for (const placed of placedItems) {
    const [w, h] = ITEMS[placed.itemId].size;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        map.set(`${placed.x + dx},${placed.y + dy}`, placed.uid);
      }
    }
  }
  return map;
}

// Emoji size scales with the shorter dimension of the item's footprint
function emojiSize(w, h) {
  const shorter = Math.min(w, h);
  return Math.round(shorter * CELL * 0.42);
}

export default function RoomGrid({
  mission,
  placedItems,
  selectedItemId,
  canAffordSelected,
  onPlace,
  onRemove,
}) {
  const [hoverCell, setHoverCell] = useState(null);
  const { gridCols, gridRows } = mission;

  const occupancy = buildOccupancy(placedItems);

  // Ghost preview
  const previewCells = new Set();
  let previewValid = false;
  if (hoverCell && selectedItemId && canAffordSelected) {
    const [w, h] = ITEMS[selectedItemId].size;
    const { x, y } = hoverCell;
    previewValid = true;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const cx = x + dx;
        const cy = y + dy;
        previewCells.add(`${cx},${cy}`);
        if (cx < 0 || cy < 0 || cx >= gridCols || cy >= gridRows || occupancy.has(`${cx},${cy}`)) {
          previewValid = false;
        }
      }
    }
  }

  function handleCellClick(x, y) {
    if (!selectedItemId || !canAffordSelected || !previewValid) return;
    onPlace(selectedItemId, x, y);
  }

  function handleRightClick(e, x, y) {
    e.preventDefault();
    const uid = occupancy.get(`${x},${y}`);
    if (uid) onRemove(uid);
  }

  const cells = [];
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      cells.push({ x: col, y: row });
    }
  }

  return (
    <div
      className="room-grid-wrapper"
      style={{ width: gridCols * CELL, height: gridRows * CELL }}
    >
      {/* Clickable background cells */}
      <div
        className="room-grid"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, ${CELL}px)`,
          gridTemplateRows: `repeat(${gridRows}, ${CELL}px)`,
        }}
      >
        {cells.map(({ x, y }) => {
          const key = `${x},${y}`;
          const isOccupied = occupancy.has(key);
          const isPreview = previewCells.has(key);
          let cls = 'grid-cell';
          if (isOccupied) cls += ' grid-cell--occupied';
          if (isPreview) cls += previewValid ? ' grid-cell--ok' : ' grid-cell--bad';
          return (
            <div
              key={key}
              className={cls}
              onMouseEnter={() => setHoverCell({ x, y })}
              onMouseLeave={() => setHoverCell(null)}
              onClick={() => handleCellClick(x, y)}
              onContextMenu={(e) => handleRightClick(e, x, y)}
            />
          );
        })}
      </div>

      {/* Placed item overlays — pointer-events: none keeps grid cells clickable */}
      {placedItems.map((placed) => {
        const item = ITEMS[placed.itemId];
        const [w, h] = item.size;
        const showLabel = w * h > 1;
        return (
          <div
            key={placed.uid}
            className="placed-item"
            style={{
              left: placed.x * CELL,
              top: placed.y * CELL,
              width: w * CELL,
              height: h * CELL,
              backgroundColor: CATEGORY_COLOR[item.category],
              '--item-border-color': CATEGORY_BORDER[item.category],
            }}
          >
            <span
              className="placed-item-emoji"
              style={{ fontSize: emojiSize(w, h) }}
            >
              {item.emoji}
            </span>
            {showLabel && (
              <span className="placed-item-label">{item.name}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
