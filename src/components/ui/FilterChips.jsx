import { FILTER_CHIPS } from '../../data/demoData'

export default function FilterChips({ active, onChange }) {
  return (
    <div className="filter-chips">
      <div className="filter-chips__scroll">
        <button
          className={`filter-chip ${!active ? 'filter-chip--active' : ''}`}
          onClick={() => onChange(null)}
        >
          All
        </button>
        {FILTER_CHIPS.map(({ label, value }) => (
          <button
            key={value}
            className={`filter-chip ${active === value ? 'filter-chip--active' : ''}`}
            onClick={() => onChange(active === value ? null : value)}
          >
            {label}
          </button>
        ))}
      </div>

      <style>{`
        .filter-chips {
          width: 100%;
          overflow: hidden;
        }

        .filter-chips__scroll {
          display: flex;
          gap: var(--space-sm);
          overflow-x: auto;
          padding: var(--space-sm) var(--space-md);
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .filter-chips__scroll::-webkit-scrollbar { display: none; }

        .filter-chip {
          flex-shrink: 0;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          background: var(--pill-bg);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.01em;
          transition: all var(--transition);
          scroll-snap-align: start;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .filter-chip:hover {
          background: var(--accent-hover);
          color: var(--text-primary);
        }

        .filter-chip--active {
          background: var(--pill-active-bg);
          color: var(--pill-active-text);
          border-color: transparent;
        }

        .filter-chip:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  )
}
