/**
 * Cloudflare exposes lightweight metadata about the request at
 * `https://speed.cloudflare.com/meta` (CORS-enabled, no auth). We use it to
 * show the user their IP, ISP/ASN, and which edge location ("colo") they're
 * being measured against — the same endpoint speed.cloudflare.com uses.
 */
export interface ConnectionMeta {
  ip: string
  isp: string
  asn: number | null
  /** Edge location IATA-style code, e.g. "FRA", "BLR". */
  colo: string
  city: string
  country: string
}

interface RawMeta {
  clientIp?: string
  asOrganization?: string
  asn?: number
  colo?: string
  city?: string
  country?: string
}

const META_URL = 'https://speed.cloudflare.com/meta'

export async function fetchConnectionMeta(
  signal?: AbortSignal,
): Promise<ConnectionMeta> {
  const res = await fetch(META_URL, { signal })
  if (!res.ok) throw new Error(`meta request failed (${res.status})`)
  const raw = (await res.json()) as RawMeta

  return {
    ip: raw.clientIp ?? '—',
    isp: raw.asOrganization ?? 'Unknown ISP',
    asn: raw.asn ?? null,
    colo: raw.colo ?? '—',
    city: raw.city ?? '',
    country: raw.country ?? '',
  }
}
