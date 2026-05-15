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

  const passedCount = goalResults.filter((g) => g.passed).length;
  const totalGoals = goalResults.length;
  const firstMissed = goalResults.find((g) => !g.passed);

  let goalsPraise, goalsSuggestion;
  if (passedCount === totalGoals) {
    goalsPraise = `🎯 You completed every single thing ${mission.client} asked for — perfect!`;
    goalsSuggestion = null;
  } else if (passedCount >= totalGoals - 1) {
    goalsPraise = `You got ${passedCount} out of ${totalGoals} of ${mission.client}'s wishes — so close!`;
    goalsSuggestion = firstMissed
      ? `Just one more thing: try adding "${firstMissed.label.toLowerCase()}" next time!`
      : null;
  } else if (passedCount >= 2) {
    goalsPraise = `You finished ${passedCount} out of ${totalGoals} of ${mission.client}'s requests — good start!`;
    goalsSuggestion = `Check the ❌ items above — ${mission.client} really wanted those too!`;
  } else {
    goalsPraise = passedCount === 1
      ? `You got one of ${mission.client}'s wishes done — that's something!`
      : `${mission.client} had a wishlist — try reading it again before placing items!`;
    goalsSuggestion = `Focus on the checklist first: make sure the most important items are in the room.`;
  }

  breakdown.push({
    label: 'Mission Goals',
    earned: goalsEarned,
    max: goalsMax,
    goalResults,
    praise: goalsPraise,
    suggestion: goalsSuggestion,
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

  let budgetPraise, budgetSuggestion;
  if (budgetRatio >= 0.6) {
    budgetPraise = `💸 Great spending! You used ${Math.round(budgetRatio * 100)}% of the budget to fill the room nicely.`;
    budgetSuggestion = null;
  } else if (budgetRatio >= 0.3) {
    budgetPraise = `You spent about ${Math.round(budgetRatio * 100)}% of your budget — a reasonable amount!`;
    budgetSuggestion = `Try spending a bit more — ${mission.client} wants a well-furnished room, not an empty one!`;
  } else if (budgetRatio > 0) {
    budgetPraise = `You placed a few items, which is a start!`;
    budgetSuggestion = `The room still has a lot of empty space. Use more of the $${mission.budget} budget to add furniture.`;
  } else {
    budgetPraise = `You still have the whole budget to spend!`;
    budgetSuggestion = `Try placing some furniture — an empty room isn't very helpful for ${mission.client}!`;
  }

  breakdown.push({
    label: 'Budget',
    earned: budgetEarned,
    max: budgetMax,
    praise: budgetPraise,
    suggestion: budgetSuggestion,
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

  const freePct = Math.round(freeRatio * 100);
  let pathPraise, pathSuggestion;
  if (freeRatio >= 0.4) {
    pathPraise = `🚶 Plenty of room to move around! About ${freePct}% of the floor is open — great space planning.`;
    pathSuggestion = null;
  } else if (freeRatio >= 0.2) {
    pathPraise = `There's some walking space (${freePct}% free) — ${mission.client} can get around, but it's a little tight.`;
    pathSuggestion = `Try removing one or two items to open up the room a bit more.`;
  } else {
    pathPraise = `You packed in a lot of furniture!`;
    pathSuggestion = `The room is quite crowded (only ${freePct}% free). Remove a few items so ${mission.client} can actually walk around.`;
  }

  breakdown.push({
    label: 'Walking Space',
    earned: pathEarned,
    max: pathMax,
    praise: pathPraise,
    suggestion: pathSuggestion,
  });
  total += pathEarned;

  // ── 4. Natural Light (10 pts) ──────────────────
  const lightMax = 10;
  const windowPlaced = placedItems.find((p) => p.itemId === 'window');
  let lightEarned = 0;
  let nearWindow = false;
  if (windowPlaced) {
    lightEarned = 5;
    nearWindow = placedItems.some((p) => {
      if (p.uid === windowPlaced.uid) return false;
      return Math.abs(p.x - windowPlaced.x) <= 2 && Math.abs(p.y - windowPlaced.y) <= 2;
    });
    if (nearWindow) lightEarned = 10;
  }

  let lightPraise, lightSuggestion;
  if (lightEarned === 10) {
    lightPraise = `☀️ The room is bright and sunny! You put furniture near the window to make the most of the light.`;
    lightSuggestion = null;
  } else if (lightEarned === 5) {
    lightPraise = `You added a window — that's great! Some natural light is coming in.`;
    lightSuggestion = `Move a desk or chair closer to the window so ${mission.client} can enjoy the sunlight even more.`;
  } else {
    lightPraise = `The room has some lighting from lamps, which helps!`;
    lightSuggestion = `Adding a window would make a big difference — natural light makes rooms feel bigger and cheerier.`;
  }

  breakdown.push({
    label: 'Lighting',
    earned: lightEarned,
    max: lightMax,
    praise: lightPraise,
    suggestion: lightSuggestion,
  });
  total += lightEarned;

  // ── 5. Coziness (5 pts) ───────────────────────
  const cozyMax = 5;
  const cozyItems = placedItems.filter((p) =>
    ['comfort', 'plant', 'light'].includes(ITEMS[p.itemId].category)
  );
  const cozyCount = cozyItems.length;
  const cozyEarned = Math.min(cozyCount, cozyMax);

  let cozyPraise, cozySuggestion;
  if (cozyEarned >= cozyMax) {
    cozyPraise = `🌿 This room feels so warm and inviting! All those cozy touches really make it special.`;
    cozySuggestion = null;
  } else if (cozyEarned >= 3) {
    cozyPraise = `You added ${cozyCount} cozy item${cozyCount !== 1 ? 's' : ''} — the room is starting to feel really nice!`;
    cozySuggestion = `A plant or a soft lamp could make it feel even more homey.`;
  } else if (cozyEarned >= 1) {
    cozyPraise = `You added a cozy touch or two — good thinking!`;
    cozySuggestion = `Try adding a rug, a plant, or a lamp to make the room feel warmer and more welcoming.`;
  } else {
    cozyPraise = `The room has the basics down!`;
    cozySuggestion = `It's missing that cozy feeling. A plant, a soft rug, or a lamp can totally transform a room!`;
  }

  breakdown.push({
    label: 'Coziness',
    earned: cozyEarned,
    max: cozyMax,
    praise: cozyPraise,
    suggestion: cozySuggestion,
  });
  total += cozyEarned;

  const stars = total >= 70 ? 3 : total >= 40 ? 2 : 1;

  return { total, stars, breakdown };
}
