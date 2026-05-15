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

// Returns the effective [width, height] of a placed item, respecting rotation.
function effectiveSize(placed) {
  const [w, h] = ITEMS[placed.itemId].size;
  return placed.rotated ? [h, w] : [w, h];
}

function buildOccupancy(placedItems) {
  const map = new Map(); // "x,y" -> uid
  for (const placed of placedItems) {
    const [w, h] = effectiveSize(placed);
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        map.set(`${placed.x + dx},${placed.y + dy}`, placed.uid);
      }
    }
  }
  return map;
}

// Emoji font size scales with the shorter dimension of the item's footprint.
function emojiSize(w, h) {
  return Math.round(Math.min(w, h) * CELL * 0.42);
}

export default function RoomGrid({
  mission,
  placedItems,
  selectedItemId,
  canAffordSelected,
  rotated,
  eraseMode,
  overlayData,
  onPlace,
  onRemove,
}) {
  const [hoverCell, setHoverCell] = useState(null);
  const { gridCols, gridRows } = mission;

  const occupancy = buildOccupancy(placedItems);

  // Ghost preview — only shown when placing (not erasing)
  const previewCells = new Set();
  let previewValid = false;
  if (hoverCell && selectedItemId && canAffordSelected && !eraseMode) {
    const [bw, bh] = ITEMS[selectedItemId].size;
    const [w, h] = rotated ? [bh, bw] : [bw, bh];
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
    if (eraseMode) {
      const uid = occupancy.get(`${x},${y}`);
      if (uid) onRemove(uid);
      return;
    }
    if (!selectedItemId || !canAffordSelected || !previewValid) return;
    onPlace(selectedItemId, x, y, rotated);
  }

  // Right-click always removes, regardless of mode
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

  const wrapperClass = `room-grid-wrapper${eraseMode ? ' room-grid-wrapper--erase' : ''}`;

  return (
    <div
      className={wrapperClass}
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

      {/* Vision overlay — sits above grid cells, below placed items */}
      {overlayData && (
        <div
          className="overlay-layer"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, ${CELL}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${CELL}px)`,
          }}
        >
          {cells.map(({ x, y }) => {
            const level = overlayData.get(`${x},${y}`);
            return (
              <div
                key={`${x},${y}`}
                className={`overlay-cell overlay-cell--${level}`}
              />
            );
          })}
        </div>
      )}

      {/* Placed item overlays — pointer-events: none keeps grid cells clickable */}
      {placedItems.map((placed) => {
        const item = ITEMS[placed.itemId];
        const [w, h] = effectiveSize(placed);
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
