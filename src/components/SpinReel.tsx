import { useEffect, useRef, useState } from 'react';
import { Spec, CLASS_COLORS, specLabel } from '../data/specs';
import './SpinReel.css';

interface Props {
  pool: Spec[];
  winner: Spec;
  onDone: () => void;
}

const SIZE = 420;
const NUM_SPINS = 7;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function drawWheel(canvas: HTMLCanvasElement, pool: Spec[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = SIZE / 2 - 6;
  const n = pool.length;
  const segAngle = (2 * Math.PI) / n;
  const fontSize = n <= 8 ? 13 : n <= 14 ? 11 : 9;

  ctx.clearRect(0, 0, SIZE, SIZE);

  pool.forEach((spec, i) => {
    const startAngle = i * segAngle;
    const endAngle = (i + 1) * segAngle;
    const midAngle = startAngle + segAngle / 2;

    // Segment fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    const [rr, gg, bb] = hexToRgb(CLASS_COLORS[spec.class]);
    const alpha = i % 2 === 0 ? 0.85 : 0.6;
    ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha})`;
    ctx.fill();

    // Segment border
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label — just spec name, rotated center-outward
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle);
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 4;
    ctx.fillText(spec.spec === spec.class ? spec.class : spec.spec, r * 0.62, 0);
    ctx.restore();
  });

  // outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function SpinReel({ pool, winner, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const doneCalledRef = useRef(false);

  const n = pool.length;
  const segAngle = 360 / n;
  const winnerIdx = pool.indexOf(winner);

  // Pointer is at the top (270° from canvas 0°/3 o'clock).
  // Rotate wheel so winner segment center aligns with 270°.
  const rawTarget = 270 - (winnerIdx + 0.5) * segAngle;
  const target = ((rawTarget % 360) + 360) % 360;
  const finalAngle = target + 360 * NUM_SPINS;

  useEffect(() => {
    if (canvasRef.current) drawWheel(canvasRef.current, pool);
  }, [pool]);

  useEffect(() => {
    const t = setTimeout(() => setSpinning(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleTransitionEnd = () => {
    if (doneCalledRef.current) return;
    doneCalledRef.current = true;
    setRevealed(true);
    setTimeout(onDone, 1200);
  };

  return (
    <div className="reel-overlay">
      <div className="reel-wrapper">
        <div className="reel-container">
          {/* Pointer triangle pointing down into wheel */}
          <div className="reel-pointer" />

          <div
            className={`reel-rot${spinning ? ' reel-rot--spin' : ''}`}
            style={{ transform: `rotate(${spinning ? finalAngle : 0}deg)` }}
            onTransitionEnd={handleTransitionEnd}
          >
            <canvas ref={canvasRef} width={SIZE} height={SIZE} />
          </div>
        </div>

        {revealed && (
          <div className="reel-result">
            <span style={{ color: CLASS_COLORS[winner.class] }}>
              {specLabel(winner)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
