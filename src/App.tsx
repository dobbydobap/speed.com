import { useMemo } from 'react'
import { useSpeedTest } from './hooks/useSpeedTest'
import { formatMs, formatSpeed, speedToFraction, speedUnit } from './lib/format'
import Gauge from './components/Gauge'
import MetricCard from './components/MetricCard'
import StartButton from './components/StartButton'
import ResultPanel from './components/ResultPanel'
import ConnectionInfo from './components/ConnectionInfo'
import { BrushStroke, RegistrationMarks } from './components/Decor'
import ThemeToggle from './components/ThemeToggle'

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
    <div className="grain relative flex min-h-screen flex-col overflow-hidden">
      <RegistrationMarks />
      <ThemeToggle />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-4 pt-6 sm:px-8">
        {/* ---- masthead (compact, single row) ---- */}
        <header className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
          <div className="relative">
            <h1 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
              SPEED<span className="text-acid">/</span>TEST
            </h1>
            <BrushStroke className="absolute -bottom-1.5 left-0 h-2.5 w-24 opacity-90" />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-acid animate-pulse-dot" />
            <span className="eyebrow hidden sm:inline">Free · Edge-measured · No ads</span>
          </div>
        </header>

        {/* ---- dashboard: content column + gauge ---- */}
        <main className="grid flex-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-10">
          {/* A — status + call to action */}
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="eyebrow mb-2">{phase === 'error' ? 'Error' : 'Status'}</p>
            <h2 className="font-display text-4xl leading-[0.92] sm:text-5xl md:text-6xl">
              {HEADLINE[phase] ?? 'TEST YOUR SPEED'}
            </h2>
            <p
              className={`mt-3 max-w-sm font-sans text-sm text-muted ${
                phase === 'idle' ? '' : 'hidden'
              }`}
            >
              {phase === 'error'
                ? error ?? 'The test could not reach the measurement endpoints.'
                : 'Download, upload, ping, jitter & bufferbloat — measured against Cloudflare’s global edge. No signup, no ads.'}
            </p>

            <div className="mt-4">
              {phase === 'idle' && <StartButton onClick={run}>Run the test</StartButton>}
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

          {/* B — gauge (hidden on small screens once finished, so numbers lead) */}
          <div
            className={`${
              phase === 'finished' ? 'hidden lg:flex' : 'flex'
            } items-center justify-center lg:col-start-2 lg:row-start-1 lg:row-span-2`}
          >
            <Gauge
              fraction={display.fraction}
              value={display.value}
              unit={display.unit}
              label={display.label}
              active={display.active}
            />
          </div>

          {/* C — metrics + verdict + connection */}
          <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-2">
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

            {phase === 'finished' && scores && <ResultPanel scores={scores} />}

            <ConnectionInfo />
          </div>
        </main>

        {/* ---- footer (slim) ---- */}
        <footer className="mt-4 flex flex-col gap-1 border-t border-line pt-3 font-mono text-[0.62rem] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Measured on Cloudflare’s edge — a full run can use several hundred MB.</span>
          <span className="text-muted/70">Open · Free · No tracking</span>
        </footer>
      </div>
    </div>
  )
}

export default App
