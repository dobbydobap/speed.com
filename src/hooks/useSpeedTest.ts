import { useCallback, useEffect, useRef, useState } from 'react'
import SpeedTest from '@cloudflare/speedtest'
import type {
  MeasurementConfig,
  MeasurementSummary,
  Results,
  Scores,
} from '@cloudflare/speedtest'

export type Phase = 'idle' | 'ping' | 'download' | 'upload' | 'finished' | 'error'

export interface LiveMetrics {
  /** Mbps */
  download: number
  /** Mbps */
  upload: number
  /** ms — unloaded (idle) latency */
  latency: number
  /** ms — unloaded jitter */
  jitter: number
  /** ms — latency while the link is saturated downloading (bufferbloat) */
  downLoadedLatency: number
  /** ms — latency while the link is saturated uploading (bufferbloat) */
  upLoadedLatency: number
}

const EMPTY: LiveMetrics = {
  download: 0,
  upload: 0,
  latency: 0,
  jitter: 0,
  downLoadedLatency: 0,
  upLoadedLatency: 0,
}

/**
 * Cloudflare's default measurement schedule, MINUS the `packetLoss` step.
 *
 * Payloads ramp small -> large so TCP windows warm up; the engine takes the
 * 90th-percentile bandwidth and median latency. We drop `packetLoss` because
 * it relies on a TURN/WebRTC relay we don't provision (and didn't ask for),
 * which would otherwise stall the run. To re-add it later, provide TURN creds
 * via `turnServerCredsApiUrl` and append `{ type: 'packetLoss', ... }`.
 */
const MEASUREMENTS: MeasurementConfig[] = [
  { type: 'latency', numPackets: 1 },
  { type: 'download', bytes: 1e5, count: 1, bypassMinDuration: true },
  { type: 'latency', numPackets: 20 },
  { type: 'download', bytes: 1e5, count: 9 },
  { type: 'download', bytes: 1e6, count: 8 },
  { type: 'upload', bytes: 1e5, count: 8 },
  { type: 'upload', bytes: 1e6, count: 6 },
  { type: 'download', bytes: 1e7, count: 6 },
  { type: 'upload', bytes: 1e7, count: 4 },
  { type: 'download', bytes: 2.5e7, count: 4 },
  { type: 'upload', bytes: 2.5e7, count: 4 },
  { type: 'download', bytes: 1e8, count: 3 },
  { type: 'upload', bytes: 5e7, count: 3 },
  { type: 'download', bytes: 2.5e8, count: 2 },
]

const toMbps = (bps?: number) => (bps ? bps / 1e6 : 0)
const toMs = (v?: number | null) => (v == null ? 0 : v)

function snapshot(results: Results): LiveMetrics {
  return {
    download: toMbps(results.getDownloadBandwidth()),
    upload: toMbps(results.getUploadBandwidth()),
    latency: toMs(results.getUnloadedLatency()),
    jitter: toMs(results.getUnloadedJitter()),
    downLoadedLatency: toMs(results.getDownLoadedLatency()),
    upLoadedLatency: toMs(results.getUpLoadedLatency()),
  }
}

function phaseFromType(type: string): Phase {
  if (type === 'download') return 'download'
  if (type === 'upload') return 'upload'
  return 'ping' // latency / latencyUnderLoad / reachability / etc.
}

export interface SpeedTestState {
  phase: Phase
  progress: number // 0..1
  live: LiveMetrics
  summary: MeasurementSummary | null
  scores: Scores | null
  error: string | null
  isRunning: boolean
}

export function useSpeedTest() {
  const engineRef = useRef<SpeedTest | null>(null)
  const [state, setState] = useState<SpeedTestState>({
    phase: 'idle',
    progress: 0,
    live: EMPTY,
    summary: null,
    scores: null,
    error: null,
    isRunning: false,
  })

  const run = useCallback(() => {
    // Always start from a clean engine so re-runs don't accumulate state.
    engineRef.current?.pause()

    const engine = new SpeedTest({ autoStart: false, measurements: MEASUREMENTS })
    engineRef.current = engine

    setState({
      phase: 'ping',
      progress: 0,
      live: EMPTY,
      summary: null,
      scores: null,
      error: null,
      isRunning: true,
    })

    engine.onPhaseChange = ({ measurementId, measurement }) => {
      setState((s) => ({
        ...s,
        phase: phaseFromType(measurement.type),
        progress: Math.min(0.99, measurementId / MEASUREMENTS.length),
      }))
    }

    engine.onResultsChange = () => {
      setState((s) => ({ ...s, live: snapshot(engine.results) }))
    }

    engine.onFinish = (results) => {
      setState((s) => ({
        ...s,
        phase: 'finished',
        progress: 1,
        isRunning: false,
        live: snapshot(results),
        summary: results.getSummary(),
        scores: results.getScores(),
      }))
    }

    engine.onError = (message) => {
      setState((s) => ({ ...s, phase: 'error', isRunning: false, error: message }))
    }

    engine.play()
  }, [])

  const reset = useCallback(() => {
    engineRef.current?.pause()
    engineRef.current = null
    setState({
      phase: 'idle',
      progress: 0,
      live: EMPTY,
      summary: null,
      scores: null,
      error: null,
      isRunning: false,
    })
  }, [])

  // Stop any in-flight test if the component unmounts.
  useEffect(() => () => engineRef.current?.pause(), [])

  return { ...state, run, reset }
}
