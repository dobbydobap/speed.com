# SPEED/TEST

A free internet speed test that doesn't try to sell you a VPN.

**Live here → https://speedcheck-1mi.pages.dev**

I got tired of speed-test sites that are 80% ads, beg you to "allow notifications,"
and somehow still feel slow. So I made my own. No ads, no signup, no tracking, and
no server for me to babysit. Open it, hit run, done.

## What you get

Download, upload, ping, jitter, and bufferbloat — that last one is the lag that
shows up when your line is actually busy (the thing that wrecks video calls). When
it finishes it also tells you, in plain language, whether your connection is good
enough for streaming, gaming, and calls.

## How it's free *and* accurate

Here's the catch with speed tests: to measure your real speed you have to flood
your connection against a server that's close to you and has way more bandwidth
than you do. Hosting that myself would cost money and would only be accurate near
wherever I parked the server.

So I don't host it. The measuring is done by Cloudflare's open-source engine
(`@cloudflare/speedtest` — the same one behind speed.cloudflare.com), which runs
against whichever Cloudflare edge is nearest you. Accurate just about everywhere,
and it costs me nothing because the site itself is just a static page.

## Two moods

There's a toggle in the top-right corner:

- **Dark** — loud, acid-green, streetwear-poster energy. The default.
- **Light** — calm, black-and-white, serif, editorial.

It remembers whichever one you pick.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

React + Vite + TypeScript + Tailwind. The speedometer is hand-rolled SVG — no chart
library, no bloat.

## Deploy

It's a static site, so it'll go anywhere (GitHub Pages, Netlify, whatever). I keep
it on Cloudflare Pages:

```bash
npm run build
npx wrangler pages deploy dist --project-name=speedcheck
```

## Honest caveats

- It leans on Cloudflare's public endpoints to do the measuring. Totally fine for a
  small project like this — just don't point a million users at it.
- A full run can chew through a few hundred MB. Maybe not on your last gig of mobile
  data.
- No packet-loss number (yet). That needs a TURN server I couldn't be bothered to
  set up.

Found a bug? Open an issue. Or don't, and we'll both pretend it's a feature.
