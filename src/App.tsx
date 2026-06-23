import { useMemo } from 'react'
import { useSpeedTest } from './hooks/useSpeedTest'
import { formatMs, formatSpeed, speedToFraction, speedUnit } from './lib/format'
import Gauge from './components/Gauge'
import MetricCard from './components/MetricCard'
import StartButton from './components/StartButton'
import ResultPanel from './components/ResultPanel'
import ConnectionInfo from './components/ConnectionInfo'
import { BrushStroke, Marquee, RegistrationMarks } from './components/Decor'

const HEADLINE: Record<string, string> = {
  idle: 'TEST YOUR SPEED',
  ping: 'PINGING…',
  download: 'PULLING DATA…',
  upload: 'PUSHING DATA…',
  finished: 'DONE.',
  error: 'NO SIGNAL',
}

function App() {
  const { phase, live, scores, error, isRunning, run, reset } = useSpeedTest()

  // What the big gauge shows depends on the phase currently being measured.
  const display = useMemo(() => {
    switch (phase) {
      case 'ping':
        return { label: 'PING', value: formatMs(live.latency), unit: 'ms', fraction: 0.04, active: true }
      case 'download':
        return {
          label: 'DOWNLOAD',
          value: formatSpeed(live.download),
          unit: speedUnit(live.download),
          fraction: speedToFraction(live.download),
          active: true,
        }
      case 'upload':
        return {
          label: 'UPLOAD',
          value: formatSpeed(live.upload),
          unit: speedUnit(live.upload),
          fraction: speedToFraction(live.upload),
          active: true,
        }
      default:
        return {
          label: phase === 'finished' ? 'DOWNLOAD' : 'READY',
          value: formatSpeed(live.download),
          unit: speedUnit(live.download),
          fraction: speedToFraction(live.download),
          active: false,
        }
    }
  }, [phase, live])

  // Bufferbloat = how much latency climbs while the link is saturated.
  const loaded = Math.max(live.downLoadedLatency, live.upLoadedLatency)
  const bloat = loaded > 0 && live.latency > 0 ? Math.max(0, loaded - live.latency) : 0
  const bloatNote = bloat < 30 ? 'low' : bloat < 100 ? 'moderate' : 'high'

  return (
    <div className="grain relative min-h-full overflow-hidden">
      <RegistrationMarks />

      <div className="mx-auto max-w-5xl px-5 pb-16 pt-7 sm:px-8">
        {/* ---- masthead ---- */}
        <header className="mb-5 flex items-end justify-between">
          <div className="relative">
            <h1 className="font-display text-4xl leading-none tracking-tight sm:text-5xl">
              SPEED<span className="text-acid">/</span>TEST
            </h1>
            <BrushStroke className="absolute -bottom-2 left-0 h-3 w-32 opacity-90" />
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="h-2 w-2 bg-acid animate-pulse-dot" />
            <span className="eyebrow">Free · Edge-measured</span>
          </div>
        </header>
      </div>

      <Marquee />

      <main className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* ---- hero ---- */}
        <section className="grid items-center gap-6 py-6 md:grid-cols-2 md:gap-8 md:py-10">
          <div className="order-1">
            <p className="eyebrow mb-3">{phase === 'error' ? 'Error' : 'Status'}</p>
            <h2 className="font-display text-4xl leading-[0.92] sm:text-5xl md:text-6xl">
              {HEADLINE[phase] ?? 'TEST YOUR SPEED'}
            </h2>
            <p
              className={`mt-4 max-w-sm font-sans text-sm text-muted ${
                phase === 'idle' ? '' : 'hidden md:block'
              }`}
            >
              {phase === 'error'
                ? error ?? 'The test could not reach the measurement endpoints.'
                : 'Download, upload, ping, jitter & bufferbloat — measured against Cloudflare’s global edge. No signup, no ads.'}
            </p>

            <div className="mt-5 md:mt-7">
              {phase === 'idle' && (
                <StartButton onClick={run}>Run the test</StartButton>
              )}
              {isRunning && (
                <span className="inline-flex items-center gap-3 font-display text-2xl uppercase text-acid">
                  <span className="h-2.5 w-2.5 bg-acid animate-pulse-dot" />
                  Measuring…
                </span>
              )}
              {(phase === 'finished' || phase === 'error') && (
                <StartButton onClick={reset} variant="outline">
                  {phase === 'error' ? 'Retry' : 'Test again'}
                </StartButton>
              )}
            </div>
          </div>

          <div className={`order-2 ${phase === 'finished' ? 'hidden md:block' : ''}`}>
            <Gauge
              fraction={display.fraction}
              value={display.value}
              unit={display.unit}
              label={display.label}
              active={display.active}
            />
          </div>
        </section>

        {/* ---- metric grid ---- */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            label="Download"
            value={formatSpeed(live.download)}
            unit={speedUnit(live.download)}
            active={phase === 'download'}
          />
          <MetricCard
            label="Upload"
            value={formatSpeed(live.upload)}
            unit={speedUnit(live.upload)}
            active={phase === 'upload'}
          />
          <MetricCard
            label="Ping"
            value={formatMs(live.latency)}
            unit="ms"
            active={phase === 'ping'}
          />
          <MetricCard label="Jitter" value={formatMs(live.jitter)} unit="ms" />
          <MetricCard
            label="Bufferbloat"
            value={bloat > 0 ? `+${formatMs(bloat)}` : '—'}
            unit="ms"
            note={bloat > 0 ? `under load · ${bloatNote}` : 'latency under load'}
          />
        </section>

        {/* ---- verdict (after finish) ---- */}
        {phase === 'finished' && scores && (
          <section className="mt-3">
            <ResultPanel scores={scores} />
          </section>
        )}

        {/* ---- connection info ---- */}
        <section className="mt-3">
          <ConnectionInfo />
        </section>

        {/* ---- footer ---- */}
        <footer className="mt-10 flex flex-col gap-2 border-t border-line pt-5 font-mono text-[0.66rem] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            Measured on Cloudflare’s edge network. A full run can transfer several
            hundred MB — mind metered connections.
          </span>
          <span className="text-muted/70">Open · Free · No tracking</span>
        </footer>
      </main>
    </div>
  )
}

export default App
