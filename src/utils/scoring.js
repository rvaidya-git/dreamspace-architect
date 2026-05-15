import { ITEMS } from '../data/items';

export function scoreRoom(placedItems, mission) {
  const totalCells = mission.gridCols * mission.gridRows;

  // Count occupied cells
  const occupiedKeys = new Set();
  for (const placed of placedItems) {
    const item = ITEMS[placed.itemId];
    const [w, h] = item.size;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        occupiedKeys.add(`${placed.x + dx},${placed.y + dy}`);
      }
    }
  }
  const freeRatio = (totalCells - occupiedKeys.size) / totalCells;

  const budgetUsed = placedItems.reduce((sum, p) => sum + ITEMS[p.itemId].cost, 0);
  const budgetRatio = budgetUsed / mission.budget;

  const breakdown = [];
  let total = 0;

  // ── 1. Mission Goals (50 pts) ──────────────────
  const goalsMax = 50;
  const ptsPerGoal = goalsMax / mission.goals.length;
  let goalsEarned = 0;
  const goalResults = mission.goals.map((goal) => {
    const passed = goal.check(placedItems);
    if (passed) goalsEarned += ptsPerGoal;
    return { id: goal.id, label: goal.label, passed };
  });
  goalsEarned = Math.round(goalsEarned);
  breakdown.push({
    label: 'Mission Goals',
    earned: goalsEarned,
    max: goalsMax,
    goalResults,
    tip:
      goalsEarned < goalsMax
        ? "Complete all the client's requests to earn full points!"
        : "You nailed every goal — the client is thrilled!",
  });
  total += goalsEarned;

  // ── 2. Budget Sense (20 pts) ───────────────────
  const budgetMax = 20;
  let budgetEarned = 0;
  if (budgetRatio >= 0.6) {
    budgetEarned = budgetMax;
  } else if (budgetRatio >= 0.3) {
    budgetEarned = Math.round(budgetMax * ((budgetRatio - 0.3) / 0.3));
  }
  budgetEarned = Math.min(budgetEarned, budgetMax);
  breakdown.push({
    label: 'Budget Sense',
    earned: budgetEarned,
    max: budgetMax,
    tip:
      budgetRatio < 0.6
        ? 'Use more of your budget — the client wants a well-furnished room!'
        : 'Smart spending! You used your budget wisely.',
  });
  total += budgetEarned;

  // ── 3. Walking Path (15 pts) ───────────────────
  const pathMax = 15;
  let pathEarned = 0;
  if (freeRatio >= 0.4) {
    pathEarned = pathMax;
  } else if (freeRatio >= 0.2) {
    pathEarned = Math.round(pathMax * ((freeRatio - 0.2) / 0.2));
  }
  breakdown.push({
    label: 'Walking Path',
    earned: pathEarned,
    max: pathMax,
    tip:
      freeRatio < 0.4
        ? 'Leave more open space so people can walk around the room!'
        : 'Great job keeping clear paths through the room!',
  });
  total += pathEarned;

  // ── 4. Natural Light (10 pts) ──────────────────
  const lightMax = 10;
  const windowPlaced = placedItems.find((p) => p.itemId === 'window');
  let lightEarned = 0;
  if (windowPlaced) {
    lightEarned = 5;
    const nearWindow = placedItems.some((p) => {
      if (p.uid === windowPlaced.uid) return false;
      return Math.abs(p.x - windowPlaced.x) <= 2 && Math.abs(p.y - windowPlaced.y) <= 2;
    });
    if (nearWindow) lightEarned = 10;
  }
  breakdown.push({
    label: 'Natural Light',
    earned: lightEarned,
    max: lightMax,
    tip: !windowPlaced
      ? 'Add a window to bring sunlight into the room!'
      : lightEarned < lightMax
      ? 'Place furniture near the window to make use of that sunlight.'
      : 'The room is beautifully lit with natural light!',
  });
  total += lightEarned;

  // ── 5. Coziness (5 pts) ───────────────────────
  const cozyMax = 5;
  const cozyCount = placedItems.filter((p) =>
    ['comfort', 'plant', 'light'].includes(ITEMS[p.itemId].category)
  ).length;
  const cozyEarned = Math.min(cozyCount, cozyMax);
  breakdown.push({
    label: 'Coziness',
    earned: cozyEarned,
    max: cozyMax,
    tip:
      cozyEarned < cozyMax
        ? 'Add plants, rugs, and lamps to make the room feel warm and cozy!'
        : 'This room feels so warm and inviting!',
  });
  total += cozyEarned;

  const stars = total >= 70 ? 3 : total >= 40 ? 2 : 1;

  return { total, stars, breakdown };
}
