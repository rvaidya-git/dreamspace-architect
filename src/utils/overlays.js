import { ITEMS } from '../data/items';

// ─────────────────────────────────────────────────────────────
// Shared helpers (kept local to avoid coupling with RoomGrid)
// ─────────────────────────────────────────────────────────────

function effectiveSize(placed) {
  const [w, h] = ITEMS[placed.itemId].size;
  return placed.rotated ? [h, w] : [w, h];
}

function buildOccupancy(placedItems) {
  const map = new Map();
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

// ─────────────────────────────────────────────────────────────
// 1. Walking-path overlay
//    Returns Map<"x,y", 'free' | 'blocked'>
// ─────────────────────────────────────────────────────────────
export function computeWalkOverlay(placedItems, gridCols, gridRows) {
  const occupancy = buildOccupancy(placedItems);
  const result = new Map();
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const key = `${col},${row}`;
      result.set(key, occupancy.has(key) ? 'blocked' : 'free');
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// 2. Light-zones overlay
//    Returns Map<"x,y", 'bright' | 'dim' | 'dark'>
//    Windows cast light up to 4.5 cells; lamps up to 2.5 cells.
// ─────────────────────────────────────────────────────────────
export function computeLightOverlay(placedItems, gridCols, gridRows) {
  const sources = [];

  for (const placed of placedItems) {
    const item = ITEMS[placed.itemId];
    const [w, h] = effectiveSize(placed);
    const cx = placed.x + w / 2;
    const cy = placed.y + h / 2;

    if (item.category === 'window') {
      sources.push({ cx, cy, radius: 4.5 });
    } else if (item.category === 'light') {
      sources.push({ cx, cy, radius: 2.5 });
    }
  }

  const result = new Map();
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const cellCx = col + 0.5;
      const cellCy = row + 0.5;

      let minDist = Infinity;
      for (const src of sources) {
        const dx = cellCx - src.cx;
        const dy = cellCy - src.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) minDist = dist;
      }

      let level;
      if (sources.length === 0 || minDist > 4) {
        level = 'dark';
      } else if (minDist > 2) {
        level = 'dim';
      } else {
        level = 'bright';
      }
      result.set(`${col},${row}`, level);
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// 3. Space-usage (crowding) overlay
//    Returns Map<"x,y", 'crowded' | 'cozy' | 'open'>
//    Counts occupied cells within a 2.5-cell radius of each cell.
// ─────────────────────────────────────────────────────────────
export function computeCrowdOverlay(placedItems, gridCols, gridRows) {
  const occupancy = buildOccupancy(placedItems);

  const result = new Map();
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      let nearbyFilled = 0;

      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (Math.sqrt(dx * dx + dy * dy) > 2.5) continue;
          const nx = col + dx;
          const ny = row + dy;
          if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue;
          if (occupancy.has(`${nx},${ny}`)) nearbyFilled++;
        }
      }

      let level;
      if (nearbyFilled >= 8) {
        level = 'crowded';
      } else if (nearbyFilled >= 3) {
        level = 'cozy';
      } else {
        level = 'open';
      }
      result.set(`${col},${row}`, level);
    }
  }
  return result;
}
