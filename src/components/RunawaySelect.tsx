import { useState, useRef, useEffect, useCallback } from 'react';
import './RunawaySelect.css';

interface Option {
  value: string;
  label: string;
  group: string;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const PANEL_W = 280;
const PANEL_H = 340;

export function RunawaySelect({ value, options, onChange, disabled, placeholder = '— None —' }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [fleeing, setFleeing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openDropdown = () => {
    if (disabled) return;
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setPos({ x: rect.left, y: rect.bottom + 6 });
    setFleeing(false);
    setOpen(true);
  };

  const flee = useCallback(() => {
    const maxX = Math.max(8, window.innerWidth - PANEL_W - 16);
    const maxY = Math.max(8, window.innerHeight - PANEL_H - 16);
    setPos({
      x: 8 + Math.random() * maxX,
      y: 8 + Math.random() * maxY,
    });
    setFleeing(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const groups = [...new Set(options.map(o => o.group))];
  const selectedLabel = options.find(o => o.value === value)?.label ?? placeholder;

  return (
    <>
      <button
        ref={triggerRef}
        className={`rs-trigger${disabled ? ' rs-trigger--disabled' : ''}`}
        onClick={openDropdown}
        type="button"
      >
        <span>{selectedLabel}</span>
        <span className="rs-arrow">▾</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className={`rs-panel${fleeing ? ' rs-panel--flee' : ''}`}
          style={{ left: pos.x, top: pos.y }}
        >
          <div
            className="rs-option"
            onMouseDown={() => { onChange(''); setOpen(false); }}
          >
            {placeholder}
          </div>

          {groups.map(group => (
            <div key={group} className="rs-group">
              <div className="rs-group-label">{group}</div>
              {options.filter(o => o.group === group).map(opt => {
                const runaway = opt.value === 'Shadow|Priest';
                return (
                  <div
                    key={opt.value}
                    className={`rs-option${value === opt.value ? ' rs-option--active' : ''}`}
                    onMouseEnter={runaway ? flee : undefined}
                    onMouseDown={() => { onChange(opt.value); setOpen(false); }}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
