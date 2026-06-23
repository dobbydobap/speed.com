import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const THEME_COLOR: Record<Theme, string> = { dark: '#0b0b0b', light: '#e9e8e3' }

function getInitial(): Theme {
  if (typeof document !== 'undefined') {
    const t = document.documentElement.getAttribute('data-theme')
    if (t === 'light') return 'light'
  }
  return 'dark'
}

/** Fixed top-right theme switch. Dark = acid streetwear, Light = calm editorial.
 *  Persists to localStorage and is applied pre-paint by a script in index.html. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitial)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* private mode / storage blocked — non-fatal */
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[theme])
  }, [theme])

  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="fixed right-3 top-3 z-50 inline-flex items-center gap-2 border border-line bg-panel/70 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink backdrop-blur transition-colors hover:border-acid hover:text-acid light:rounded-full"
    >
      {theme === 'dark' ? (
        // sun → click to go light
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M19.8 4.2l-2.1 2.1M6.3 17.7l-2.1 2.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // moon → click to go dark
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}
