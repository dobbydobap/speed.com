import { useEffect, useState } from 'react'
import { fetchConnectionMeta, type ConnectionMeta } from '../lib/meta'

/** Shows who/where you are on the network: IP, ISP, and the Cloudflare edge
 *  ("colo") your test is running against. Fetched once on mount. */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="eyebrow mb-1">{label}</div>
      <div className="truncate font-mono text-sm text-ink" title={value}>
        {value}
      </div>
    </div>
  )
}

export default function ConnectionInfo() {
  const [meta, setMeta] = useState<ConnectionMeta | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    fetchConnectionMeta(ctrl.signal)
      .then(setMeta)
      .catch((e) => {
        if (!ctrl.signal.aborted) setFailed(true)
        void e
      })
    return () => ctrl.abort()
  }, [])

  const edge = meta
    ? [meta.colo, [meta.city, meta.country].filter(Boolean).join(', ')]
        .filter(Boolean)
        .join(' · ')
    : ''

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 border border-line bg-panel/40 px-4 py-4 sm:grid-cols-3">
      {failed ? (
        <div className="col-span-full font-mono text-xs text-muted">
          Connection details unavailable.
        </div>
      ) : !meta ? (
        <div className="col-span-full font-mono text-xs text-muted">Locating your connection…</div>
      ) : (
        <>
          <Field label="Your IP" value={meta.ip} />
          <Field label="ISP" value={meta.asn ? `${meta.isp} · AS${meta.asn}` : meta.isp} />
          <Field label="Cloudflare edge" value={edge || '—'} />
        </>
      )}
    </div>
  )
}
