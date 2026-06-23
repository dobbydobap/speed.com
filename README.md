# SPEED/TEST — free, accurate internet speed test

A free, no-backend internet speed test with an acid-streetwear UI. Measures
**download, upload, ping, jitter and bufferbloat** against Cloudflare's global
edge — no signup, no ads, no tracking.

## Why it's accurate (and free)

Measuring a connection's real throughput means saturating the link against a
server that is both **close to the user** and has **far more bandwidth** than
the user's pipe. Self-hosting that on a cheap VPS caps accuracy (one region,
limited bandwidth) and costs money.

Instead this app uses the official open-source
[`@cloudflare/speedtest`](https://github.com/cloudflare/speedtest) engine — the
same one behind [speed.cloudflare.com](https://speed.cloudflare.com). It runs
entirely in the browser against Cloudflare's anycast edge (a node near every
user), uses `PerformanceResourceTiming` for byte-accurate timing, ramps payloads
small → large so TCP windows warm up, and aggregates with **percentiles**
(90th-percentile bandwidth, median latency). Result: Ookla-comparable accuracy,
**$0** to run, nothing to host or maintain.

## Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** (design tokens in `src/index.css` under `@theme`)
- **`@cloudflare/speedtest`** measurement engine
- Custom SVG gauge — no charting dependency

## Project layout

| Path | Role |
| --- | --- |
| `src/hooks/useSpeedTest.ts` | Wraps the engine; exposes phase, live Mbps/ms, scores |
| `src/lib/meta.ts` | Fetches IP / ISP / edge colo from `speed.cloudflare.com/meta` |
| `src/lib/format.ts` | Speed/latency formatting + log gauge scale |
| `src/components/Gauge.tsx` | 270° SVG speedometer |
| `src/components/*` | MetricCard, ResultPanel, ConnectionInfo, StartButton, Decor |
| `src/App.tsx` | Phase orchestration (idle → ping → download → upload → done) |

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
npm run lint
```

## Deploy (Cloudflare Pages — free)

Static output, no env vars or secrets.

- **Build command:** `npm run build`
- **Output directory:** `dist`

Either connect the Git repo in the Cloudflare Pages dashboard, or:

```bash
npm run build
npx wrangler pages deploy dist
```

Works equally on GitHub Pages / Netlify / Vercel as a static site.

## Notes & caveats

- **Third-party endpoints:** measurement traffic goes to Cloudflare's public
  endpoints (the published library's intended use; fine for low traffic).
- **Data usage:** a full run on a fast link can transfer **several hundred MB** —
  mind metered/mobile connections.
- **Browser-only:** relies on `fetch` + `PerformanceResourceTiming`.
- **Packet loss** is intentionally omitted: the default engine's packet-loss step
  needs a WebRTC/TURN relay we don't provision. To add it, supply TURN creds via
  `turnServerCredsApiUrl` and append a `{ type: 'packetLoss', ... }` entry to the
  `MEASUREMENTS` array in `useSpeedTest.ts`.
- **Quality verdict:** the streaming/gaming/video-call stars come from the
  engine's AIM scores (`results.getScores()`).
