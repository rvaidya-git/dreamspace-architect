import { ITEMS_LIST } from '../data/items';

const CATEGORY_COLOR = {
  sleep:   '#B8D4E8',
  work:    '#F0E6B3',
  light:   '#FFF0A0',
  plant:   '#C8E6C9',
  comfort: '#FFD4D4',
  storage: '#E1D4F0',
  window:  '#B3E5FC',
};

export default function ItemPalette({ selectedItemId, onSelect, budget }) {
  return (
    <div className="item-palette">
      <h3 className="palette-title">🛋️ Items</h3>
      <p className="palette-hint">Pick an item, then click the room to place it.</p>

      <div className="palette-list">
        {ITEMS_LIST.map((item) => {
          const canAfford = item.cost <= budget;
          const isSelected = item.id === selectedItemId;
          return (
            <button
              key={item.id}
              className={`palette-item${isSelected ? ' palette-item--selected' : ''}${!canAfford ? ' palette-item--unaffordable' : ''}`}
              style={{ '--item-color': CATEGORY_COLOR[item.category] }}
              onClick={() => canAfford && onSelect(isSelected ? null : item.id)}
              disabled={!canAfford}
              title={!canAfford ? `Not enough budget ($${item.cost} needed)` : `${item.name} — $${item.cost}`}
            >
              <span className="palette-emoji">{item.emoji}</span>
              <span className="palette-name">{item.name}</span>
              <span className="palette-cost">${item.cost}</span>
              <span className="palette-size">{item.size[0]}×{item.size[1]}</span>
            </button>
          );
        })}
      </div>

      {selectedItemId && (
        <button className="btn-cancel" onClick={() => onSelect(null)}>
          ✕ Cancel selection
        </button>
      )}
    </div>
  );
}
