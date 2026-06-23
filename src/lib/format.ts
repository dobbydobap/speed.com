/** Format a Mbps value with sensible precision for a big display number. */
export function formatSpeed(mbps: number): string {
  if (!mbps || mbps < 0) return '0.0'
  if (mbps >= 1000) return (mbps / 1000).toFixed(2) // show as Gbps-scale number
  if (mbps >= 100) return mbps.toFixed(0)
  if (mbps >= 10) return mbps.toFixed(1)
  return mbps.toFixed(2)
}

/** Unit label that pairs with formatSpeed (handles the Gbps crossover). */
export function speedUnit(mbps: number): string {
  return mbps >= 1000 ? 'Gbps' : 'Mbps'
}

/** Milliseconds, rounded for display. */
export function formatMs(ms: number): string {
  if (!ms) return '0'
  return ms < 10 ? ms.toFixed(1) : Math.round(ms).toString()
}

/**
 * Map a speed (Mbps) to a 0..1 gauge fraction on a logarithmic scale, so the
 * needle moves nicely across the huge dynamic range of real connections
 * (sub-1 Mbps to multi-gigabit) instead of hugging the low end.
 */
export function speedToFraction(mbps: number, max = 1000): number {
  if (mbps <= 0) return 0
  const f = Math.log10(1 + mbps) / Math.log10(1 + max)
  return Math.max(0, Math.min(1, f))
}
