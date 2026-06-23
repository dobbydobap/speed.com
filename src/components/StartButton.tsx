/** Big acid CTA with a hand-painted brush underline. Two variants: the loud
 *  solid "GO" and a quieter outline used for re-runs. */
interface StartButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'solid' | 'outline'
  disabled?: boolean
}

export default function StartButton({
  onClick,
  children,
  variant = 'solid',
  disabled,
}: StartButtonProps) {
  const base =
    'group relative inline-flex items-center gap-3 px-9 py-4 font-display text-2xl uppercase tracking-wide transition-transform active:translate-y-px disabled:opacity-40 disabled:pointer-events-none'

  const skin =
    variant === 'solid'
      ? 'bg-acid text-black hover:brightness-110'
      : 'border border-line text-ink hover:border-acid hover:text-acid'

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${skin}`}>
      <span>{children}</span>
      <svg width="34" height="14" viewBox="0 0 34 14" aria-hidden className="overflow-visible">
        <path
          d="M2 9 C 9 3, 15 12, 22 6 S 30 8, 32 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="transition-transform group-hover:translate-x-1"
        />
      </svg>
    </button>
  )
}
