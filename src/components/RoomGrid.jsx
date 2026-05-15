import { useState } from 'react';
import { ITEMS } from '../data/items';

const CELL = 60; // px per grid cell

const CATEGORY_COLOR = {
  sleep:   '#B8D4E8',
  work:    '#F0E6B3',
  light:   '#FFF0A0',
  plant:   '#C8E6C9',
  comfort: '#FFD4D4',
  storage: '#E1D4F0',
  window:  '#B3E5FC',
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

  // Compute ghost preview when a cell is hovered with an item selected
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

  // Build flat list of cells to render
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
          const isPreview = previewCells.has(key);
          let cls = 'grid-cell';
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

      {/* Placed item overlays — pointer-events: none so grid cells stay clickable */}
      {placedItems.map((placed) => {
        const item = ITEMS[placed.itemId];
        const [w, h] = item.size;
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
            }}
          >
            <span className="placed-item-emoji">{item.emoji}</span>
            <span className="placed-item-label">{item.name}</span>
          </div>
        );
      })}
    </div>
  );
}
