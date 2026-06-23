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
  clientIp?: unknown
  asOrganization?: unknown
  asn?: unknown
  colo?: unknown
  city?: unknown
  country?: unknown
}

const META_URL = 'https://speed.cloudflare.com/meta'

export async function fetchConnectionMeta(
  signal?: AbortSignal,
): Promise<ConnectionMeta> {
  const res = await fetch(META_URL, { signal })
  if (!res.ok) throw new Error(`meta request failed (${res.status})`)
  const raw = (await res.json()) as RawMeta

  // The endpoint's JSON is untrusted — some fields (notably `colo`) have been
  // seen to come back as objects, so coerce every value to a safe string.
  const str = (v: unknown, fallback = '') =>
    typeof v === 'string' && v.length > 0 ? v : fallback

  return {
    ip: str(raw.clientIp, '—'),
    isp: str(raw.asOrganization, 'Unknown ISP'),
    asn: typeof raw.asn === 'number' ? raw.asn : null,
    colo: str(raw.colo),
    city: str(raw.city),
    country: str(raw.country),
  }
}
