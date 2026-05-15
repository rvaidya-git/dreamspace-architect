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
    ? 'Select an item from the left, then click the room to place it. Right-click to remove.'
    : canAffordSelected
    ? `Placing: ${selectedItem.emoji} ${selectedItem.name} (${selectedItem.size[0]}×${selectedItem.size[1]}) — click to place · right-click to remove`
    : `⚠️ Not enough budget for ${selectedItem.name} ($${selectedItem.cost})`;

  return (
    <div className="design-room">
      <header className="design-header">
        {/* Speech-bubble client brief */}
        <div className="client-bubble">
          <div className="client-avatar">{mission.clientEmoji}</div>
          <div className="client-speech">
            <div className="client-speech-name">{mission.client}&apos;s Wishlist</div>
            <div className="client-speech-text">{mission.brief}</div>
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
            <div className="grid-label">{mission.title}</div>
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
