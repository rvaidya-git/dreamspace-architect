import { ITEMS_LIST } from '../data/items';

const CATEGORY_INFO = {
  sleep:   { label: 'Sleeping',  color: 'var(--c-sleep)',   border: 'var(--cb-sleep)'   },
  work:    { label: 'Working',   color: 'var(--c-work)',    border: 'var(--cb-work)'    },
  light:   { label: 'Lighting',  color: 'var(--c-light)',   border: 'var(--cb-light)'   },
  window:  { label: 'Windows',   color: 'var(--c-window)',  border: 'var(--cb-window)'  },
  plant:   { label: 'Plants',    color: 'var(--c-plant)',   border: 'var(--cb-plant)'   },
  storage: { label: 'Storage',   color: 'var(--c-storage)', border: 'var(--cb-storage)' },
  comfort: { label: 'Comfort',   color: 'var(--c-comfort)', border: 'var(--cb-comfort)' },
};

const CATEGORY_ORDER = ['sleep', 'work', 'light', 'window', 'plant', 'storage', 'comfort'];

export default function ItemPalette({ selectedItemId, onSelect, budget }) {
  return (
    <div className="item-palette">
      <div className="palette-header">
        <h3 className="palette-title">🛋️ Furniture</h3>
        <p className="palette-hint">Click an item, then click the room to place it.</p>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const items = ITEMS_LIST.filter((i) => i.category === cat);
        if (!items.length) return null;
        const info = CATEGORY_INFO[cat];

        return (
          <div key={cat} className="palette-group">
            <div className="palette-group-label">{info.label}</div>
            <div className="palette-list">
              {items.map((item) => {
                const canAfford = item.cost <= budget;
                const isSelected = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    className={`palette-item${isSelected ? ' palette-item--selected' : ''}${!canAfford ? ' palette-item--unaffordable' : ''}`}
                    style={{
                      '--item-color': info.color,
                      '--item-border': info.border,
                    }}
                    onClick={() => canAfford && onSelect(isSelected ? null : item.id)}
                    disabled={!canAfford}
                    title={
                      !canAfford
                        ? `Can't afford this! It costs $${item.cost}`
                        : `${item.name} · $${item.cost} · ${item.size[0]}×${item.size[1]} tiles`
                    }
                  >
                    <span className="palette-emoji">{item.emoji}</span>
                    <span className="palette-name">{item.name}</span>
                    <span className="palette-cost">${item.cost}</span>
                    <span className="palette-size">
                      {item.size[0]}×{item.size[1]} tiles
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedItemId && (
        <button className="btn-cancel" onClick={() => onSelect(null)}>
          ✕ Deselect
        </button>
      )}
    </div>
  );
}
