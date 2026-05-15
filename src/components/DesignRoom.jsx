import { ITEMS } from '../data/items';
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
}) {
  const spent = placedItems.reduce((sum, p) => sum + ITEMS[p.itemId].cost, 0);
  const remaining = mission.budget - spent;

  const selectedItem = selectedItemId ? ITEMS[selectedItemId] : null;
  const canAffordSelected = selectedItem ? selectedItem.cost <= remaining : false;

  const hint = !selectedItemId
    ? 'Select an item from the left, then click the room to place it.'
    : canAffordSelected
    ? `Placing: ${selectedItem.name} — click to place, right-click to remove`
    : 'Not enough budget for this item!';

  return (
    <div className="design-room">
      <header className="design-header">
        <div className="client-brief">
          <span className="client-emoji">{mission.clientEmoji}</span>
          <div className="client-text">
            <div className="client-name">{mission.client}&apos;s Room</div>
            <div className="client-message">{mission.brief}</div>
          </div>
        </div>
        <BudgetTracker spent={spent} total={mission.budget} />
        <button className="btn-primary btn-submit" onClick={onSubmit}>
          Submit Design ✓
        </button>
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
            <div className="grid-hint">{hint}</div>
            <RoomGrid
              mission={mission}
              placedItems={placedItems}
              selectedItemId={selectedItemId}
              canAffordSelected={canAffordSelected}
              onPlace={onPlace}
              onRemove={onRemove}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
