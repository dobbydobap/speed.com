/**
 * Acid-streetwear speedometer. A 270° SVG arc on a dark track, filled with the
 * neon accent via `pathLength`/`strokeDashoffset` (so the sweep animates cheaply
 * with a CSS transition). HUD tick marks ring the arc; the live value sits in
 * the middle in the condensed display face.
 */

const SIZE = 320
const C = SIZE / 2 // center
const R = 132 // arc radius
const START = 225 // bottom-left, in degrees clockwise from top
const SWEEP = 270 // total span; gap sits at the bottom

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

function arcPath(cx: number, cy: number, r: number, start: number, sweep: number) {
  const [sx, sy] = polar(cx, cy, r, start)
  const [ex, ey] = polar(cx, cy, r, start + sweep)
  const large = sweep > 180 ? 1 : 0
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`
}

const TRACK = arcPath(C, C, R, START, SWEEP)

// HUD tick marks around the arc — majors longer + brighter.
const TICKS = Array.from({ length: 37 }, (_, i) => {
  const t = i / 36
  const angle = START + t * SWEEP
  const major = i % 6 === 0
  const [x1, y1] = polar(C, C, R + 12, angle)
  const [x2, y2] = polar(C, C, R + (major ? 24 : 19), angle)
  return { x1, y1, x2, y2, major }
})

interface GaugeProps {
  /** 0..1 fill of the arc. */
  fraction: number
  /** Pre-formatted big number. */
  value: string
  unit: string
  label: string
  /** Pulse/glow while a measurement is active. */
  active?: boolean
}

export default function Gauge({ fraction, value, unit, label, active }: GaugeProps) {
  const f = Math.max(0, Math.min(1, fraction))

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[248px] select-none sm:max-w-[300px] md:max-w-[360px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full overflow-visible">
        <defs>
          <filter id="acidGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* tick ring */}
        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            className={t.major ? 'stroke-blue' : 'stroke-line'}
            strokeWidth={t.major ? 2 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* track */}
        <path
          d={TRACK}
          className="stroke-line"
          strokeWidth={16}
          strokeLinecap="round"
          fill="none"
        />

        {/* fill */}
        <path
          d={TRACK}
          className="gauge-arc stroke-acid"
          strokeWidth={16}
          strokeLinecap="round"
          fill="none"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - f * 100}
          filter={active ? 'url(#acidGlow)' : undefined}
        />
      </svg>

      {/* center readout */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="eyebrow mb-2">{label}</span>
        <span
          className="font-display leading-none text-acid tabular-nums"
          style={{ fontSize: 'clamp(3.25rem, 16vw, 5.5rem)' }}
        >
          {value}
        </span>
        <span className="mt-1 font-mono text-sm tracking-[0.3em] text-muted uppercase">
          {unit}
        </span>
      </div>
    </div>
  )
}
