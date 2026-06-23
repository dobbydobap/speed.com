/** HUD-style metric tile: tracked label, big mono value, unit. Highlights when
 *  its phase is the one currently being measured. */
interface MetricCardProps {
  label: string
  value: string
  unit: string
  active?: boolean
  /** Small note under the value, e.g. a bufferbloat verdict. */
  note?: string
}

export default function MetricCard({ label, value, unit, active, note }: MetricCardProps) {
  return (
    <div
      className={[
        'relative border bg-panel/60 px-4 py-3 transition-colors',
        active ? 'border-acid' : 'border-line',
      ].join(' ')}
    >
      {/* active corner tick */}
      {active && <span className="absolute right-2 top-2 h-1.5 w-1.5 bg-acid animate-pulse-dot" />}
      <div className="eyebrow mb-1.5">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={[
            'font-display text-3xl leading-none tabular-nums sm:text-4xl',
            active ? 'text-acid' : 'text-ink',
          ].join(' ')}
        >
          {value}
        </span>
        <span className="font-mono text-[0.7rem] tracking-widest text-muted uppercase">
          {unit}
        </span>
      </div>
      {note && <div className="mt-1 font-mono text-[0.66rem] text-muted">{note}</div>}
    </div>
  )
}
