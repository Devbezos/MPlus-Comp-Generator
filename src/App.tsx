import { useState, useEffect } from 'react';
import { SPECS, CLASS_COLORS, ROLE_COLORS, specLabel, TriState, Spec } from './data/specs';
import { SpinReel } from './components/SpinReel';
import { HistoryPanel } from './components/HistoryPanel';
import { useHistory } from './hooks/useHistory';
import './App.css';

interface Constraints {
  lust: TriState;
  brez: TriState;
  melee: TriState;
}

interface SpinState {
  slotIndex: number;
  pool: Spec[];
  winner: Spec;
}

// Labels shown for empty slots
const EMPTY_LABELS = ['TANK', 'HEAL', 'DPS', 'DPS', 'DPS'] as const;

// Classes in alphabetical order for the grouped dropdown
const CLASSES = [...new Set(SPECS.map(s => s.class))].sort();

/** Which slot index the player occupies based on their role */
function playerSlotIndex(s: Spec): number {
  if (s.role === 'TANK') return 0;
  if (s.role === 'HEALER') return 1;
  return 2; // first DPS slot
}

/** Build initial slots array with the player's spec locked in */
function makeSlots(playerSpec: Spec | null): (Spec | null)[] {
  const slots: (Spec | null)[] = Array(5).fill(null);
  if (playerSpec) slots[playerSlotIndex(playerSpec)] = playerSpec;
  return slots;
}

function isSameSpec(a: Spec, b: Spec) {
  return a.spec === b.spec && a.class === b.class;
}

function getPool(
  slotIndex: number,
  constraints: Constraints,
  exclude: Spec | null,
  currentSlots: (Spec | null)[],
): Spec[] {
  const slotStep = slotIndex <= 1 ? slotIndex : 2;

  // Base pool by role
  let base: Spec[];
  if (slotStep === 0) base = SPECS.filter(s => s.role === 'TANK');
  else if (slotStep === 1) base = SPECS.filter(s => s.role === 'HEALER');
  else base = SPECS.filter(s => s.role === 'MDPS' || s.role === 'RDPS');

  // Exclude the player's own spec
  if (exclude) base = base.filter(s => !isSameSpec(s, exclude));

  // Other already-filled slots (not the one being rolled)
  const others = currentSlots.filter((s, i) => i !== slotIndex && s !== null) as Spec[];
  const othersHaveLust = others.some(s => s.lust);
  const othersHaveBrez = others.some(s => s.brez);
  const othersHaveMelee = others.some(s => s.role === 'MDPS');

  let pool = [...base];

  // "require" is already satisfied by another slot — no filter needed for this one
  if (constraints.lust === 'require' && !othersHaveLust) pool = pool.filter(s => s.lust);
  else if (constraints.lust === 'prevent') pool = pool.filter(s => !s.lust);

  if (constraints.brez === 'require' && !othersHaveBrez) pool = pool.filter(s => s.brez);
  else if (constraints.brez === 'prevent') pool = pool.filter(s => !s.brez);

  if (slotStep >= 2) {
    if (constraints.melee === 'require' && !othersHaveMelee) pool = pool.filter(s => s.role === 'MDPS');
    else if (constraints.melee === 'prevent') pool = pool.filter(s => s.role !== 'MDPS');
  }

  // Fallback to unfiltered base if constraints made pool empty
  return pool.length > 0 ? pool : base;
}

function cycle(c: TriState): TriState {
  if (c === null) return 'require';
  if (c === 'require') return 'prevent';
  return null;
}

function btnLabel(name: string, c: TriState): string {
  if (c === 'require') return `${name} ✓`;
  if (c === 'prevent') return `${name} ✗`;
  return name;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function App() {
  const [playerSpec, setPlayerSpec] = useState<Spec | null>(null);
  const [slots, setSlots] = useState<(Spec | null)[]>(Array(5).fill(null));
  const [step, setStep] = useState(0); // index of next slot to roll; ≥5 = done
  const [spin, setSpin] = useState<SpinState | null>(null);
  const [constraints, setConstraints] = useState<Constraints>({ lust: null, brez: null, melee: null });
  const { entries: history, addEntry, clearHistory } = useHistory();

  const allDone = step >= 5;

  // Record history entry when the party becomes complete
  useEffect(() => {
    if (allDone && slots.every(Boolean)) {
      addEntry(slots as Spec[]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  const handleSetPlayer = (value: string) => {
    if (!value) {
      setPlayerSpec(null);
      setSlots(Array(5).fill(null));
      setStep(0);
      return;
    }
    const [specName, className] = value.split('|');
    const found = SPECS.find(s => s.spec === specName && s.class === className) ?? null;
    setPlayerSpec(found);
    if (found) {
      const newSlots = makeSlots(found);
      setSlots(newSlots);
      const nextEmpty = newSlots.findIndex(s => s === null);
      setStep(nextEmpty === -1 ? 5 : nextEmpty);
    }
  };

  const startSpin = (slotIndex: number, currentSlots: (Spec | null)[]) => {
    const pool = getPool(slotIndex, constraints, playerSpec, currentSlots);
    const winner = pickRandom(pool);
    setSpin({ slotIndex, pool, winner });
  };

  const handleRoll = () => {
    if (allDone) {
      // Reset: re-apply player spec if set
      const newSlots = makeSlots(playerSpec);
      setSlots(newSlots);
      const nextEmpty = newSlots.findIndex(s => s === null);
      setStep(nextEmpty === -1 ? 5 : nextEmpty);
      return;
    }
    startSpin(step, slots);
  };

  const handleReroll = (slotIndex: number) => {
    startSpin(slotIndex, slots);
  };

  const handleSpinDone = () => {
    if (!spin) return;
    let newSlots: (Spec | null)[] = [];
    setSlots(prev => {
      const next = [...prev];
      next[spin.slotIndex] = spin.winner;
      newSlots = next;
      return next;
    });
    // Advance to the next unfilled slot
    setTimeout(() => {
      setSlots(cur => {
        const nextEmpty = cur.findIndex(s => s === null);
        setStep(nextEmpty === -1 ? 5 : nextEmpty);
        return cur;
      });
      setSpin(null);
    }, 0);
  };

  const rollLabel = allDone
    ? 'Reset'
    : step === 0 ? 'Roll Tank'
    : step === 1 ? 'Roll Healer'
    : 'Roll DPS';

  // Utility summary for the footer
  const filled = slots.filter(Boolean) as Spec[];
  const hasLust = filled.some(s => s.lust);
  const hasBrez = filled.some(s => s.brez);
  const meleeCount = filled.filter(s => s.role === 'MDPS').length;
  const rangedCount = filled.filter(s => s.role === 'RDPS').length;

  return (
    <div className="app">
      {spin && (
        <SpinReel pool={spin.pool} winner={spin.winner} onDone={handleSpinDone} />
      )}

      <header className="app-header">
        <h1 className="app-title">Key Vibes</h1>
        <p className="app-subtitle">M+ Party Generator</p>
      </header>

      {/* Player spec picker */}
      <section className="player-section">
        <label className="player-label" htmlFor="player-select">Playing as</label>
        <select
          id="player-select"
          className="player-select"
          value={playerSpec ? `${playerSpec.spec}|${playerSpec.class}` : ''}
          onChange={e => handleSetPlayer(e.target.value)}
          disabled={!!spin}
        >
          <option value="">— None —</option>
          {CLASSES.map(cls => (
            <optgroup key={cls} label={cls}>
              {SPECS.filter(s => s.class === cls).map(s => (
                <option key={`${s.spec}|${s.class}`} value={`${s.spec}|${s.class}`}>
                  {specLabel(s)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </section>

      {/* Constraint toggles */}
      <section className="constraints">
        <button
          className={`cbtn cbtn--${constraints.lust ?? 'off'}`}
          onClick={() => setConstraints(c => ({ ...c, lust: cycle(c.lust) }))}
        >
          {btnLabel('Lust', constraints.lust)}
        </button>
        <button
          className={`cbtn cbtn--${constraints.brez ?? 'off'}`}
          onClick={() => setConstraints(c => ({ ...c, brez: cycle(c.brez) }))}
        >
          {btnLabel('BRez', constraints.brez)}
        </button>
        <button
          className={`cbtn cbtn--${constraints.melee ?? 'off'}`}
          onClick={() => setConstraints(c => ({ ...c, melee: cycle(c.melee) }))}
        >
          {btnLabel('Melee', constraints.melee)}
        </button>
      </section>

      {/* Party slot rows */}
      <section className="slots">
        {slots.map((slot, i) => {
          const isPlayer = !!slot && !!playerSpec && isSameSpec(slot, playerSpec);
          const isActive = i === step && !allDone && !isPlayer;
          const roleDisplay = slot
            ? (slot.role === 'HEALER' ? 'HEAL' : slot.role)
            : EMPTY_LABELS[i];
          const roleColor = slot ? ROLE_COLORS[slot.role] : '#3a3a5a';
          const nameColor = slot ? CLASS_COLORS[slot.class] : '#2e2e44';

          return (
            <div key={i} className={`slot${isActive ? ' slot--active' : ''}${isPlayer ? ' slot--you' : ''}`}>
              <span className="slot-role" style={{ color: roleColor }}>
                {roleDisplay}
              </span>
              <span className="slot-name" style={{ color: nameColor }}>
                {slot ? specLabel(slot) : '—'}
              </span>
              {isPlayer && <span className="slot-you-badge">YOU</span>}
              {slot && !isPlayer && (
                <button
                  className="reroll-btn"
                  title="Reroll this slot"
                  onClick={() => handleReroll(i)}
                  disabled={!!spin}
                >
                  ↺
                </button>
              )}
            </div>
          );
        })}
      </section>

      {/* Main action button */}
      <div className="roll-row">
        <button className="roll-btn" onClick={handleRoll} disabled={!!spin}>
          {rollLabel}
        </button>
      </div>

      {/* Utility footer — only after all slots filled */}
      {allDone && (
        <footer className="util-footer">
          <span className={`util ${hasLust ? 'util--have' : 'util--miss'}`}>
            Lust {hasLust ? '✓' : '✗'}
          </span>
          <span className={`util ${hasBrez ? 'util--have' : 'util--miss'}`}>
            BRez {hasBrez ? '✓' : '✗'}
          </span>
          <span className="util util--neutral">{meleeCount} Melee</span>
          <span className="util util--neutral">{rangedCount} Ranged</span>
        </footer>
      )}

      {/* History */}
      <HistoryPanel entries={history} onClear={clearHistory} />
    </div>
  );
}
