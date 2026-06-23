import type { Scores } from '@cloudflare/speedtest'

/**
 * Final verdict block. Renders the engine's AIM experience scores
 * (streaming / gaming / video-calls) as ★ rows — the "ART TO TREND" rating
 * motif from the reference, driven by real network quality.
 */

const STAR_TOTAL = 5

// Friendly labels + ordering for the experiences the engine reports. Unknown
// keys still render, prettified, so we never silently drop a score.
const EXPERIENCE_META: Record<string, { label: string; hint: string }> = {
  streaming: { label: 'STREAMING', hint: '4K / HD video' },
  gaming: { label: 'GAMING', hint: 'Low-lag online play' },
  rtc: { label: 'VIDEO CALLS', hint: 'Zoom · Meet · FaceTime' },
}
const ORDER = ['streaming', 'gaming', 'rtc']

const CLASS_COLOR: Record<string, string> = {
  bad: 'text-red-400',
  poor: 'text-orange-400',
  average: 'text-ink',
  good: 'text-acid',
  great: 'text-acid',
}

function Stars({ filled }: { filled: number }) {
  return (
    <div className="flex gap-1" aria-label={`${filled} of ${STAR_TOTAL}`}>
      {Array.from({ length: STAR_TOTAL }, (_, i) => (
        <span
          key={i}
          className={i < filled ? 'text-acid' : 'text-line'}
          style={{ fontSize: '1.1rem', lineHeight: 1 }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function ResultPanel({ scores }: { scores: Scores }) {
  const keys = Object.keys(scores)
  const ordered = [
    ...ORDER.filter((k) => k in scores),
    ...keys.filter((k) => !ORDER.includes(k)),
  ]

  return (
    <section className="border border-line bg-panel/40">
      <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="eyebrow">Verdict — what your line is good for</span>
        <span className="font-mono text-[0.66rem] text-muted">AIM</span>
      </header>

      <div className="divide-y divide-line">
        {ordered.map((key) => {
          const s = scores[key]
          const meta = EXPERIENCE_META[key] ?? {
            label: key.toUpperCase(),
            hint: '',
          }
          return (
            <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="font-display text-lg uppercase leading-none">{meta.label}</div>
                {meta.hint && (
                  <div className="mt-1 font-mono text-[0.66rem] text-muted">{meta.hint}</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Stars filled={s.classificationIdx + 1} />
                <span
                  className={`font-mono text-[0.66rem] uppercase tracking-widest ${
                    CLASS_COLOR[s.classificationName] ?? 'text-muted'
                  }`}
                >
                  {s.classificationName}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
