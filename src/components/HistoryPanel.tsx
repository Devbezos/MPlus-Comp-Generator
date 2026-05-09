import { useState } from 'react';
import { CLASS_COLORS, ROLE_COLORS, specLabel } from '../data/specs';
import { HistoryEntry } from '../hooks/useHistory';
import './HistoryPanel.css';

interface Props {
  entries: HistoryEntry[];
  onClear: () => void;
}

function fmt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function HistoryPanel({ entries, onClear }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="hist">
      <button className="hist-toggle" onClick={() => setOpen(o => !o)}>
        History {entries.length > 0 && <span className="hist-count">{entries.length}</span>}
        <span className="hist-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="hist-body">
          {entries.length === 0 ? (
            <p className="hist-empty">No rolls yet.</p>
          ) : (
            <>
              <button className="hist-clear" onClick={onClear}>Clear all</button>
              <ol className="hist-list">
                {entries.map(e => (
                  <li key={e.id} className="hist-entry">
                    <span className="hist-date">{fmt(e.date)}</span>
                    <div className="hist-slots">
                      {e.slots.map((s, i) => (
                        <span
                          key={i}
                          className="hist-spec"
                          style={{ color: CLASS_COLORS[s.class] }}
                          title={`${s.role === 'HEALER' ? 'Heal' : s.role} — ${specLabel(s)}`}
                        >
                          <span className="hist-role" style={{ color: ROLE_COLORS[s.role] }}>
                            {s.role === 'HEALER' ? 'H' : s.role === 'TANK' ? 'T' : s.role === 'MDPS' ? 'M' : 'R'}
                          </span>
                          {specLabel(s)}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}
