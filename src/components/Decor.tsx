/** Decorative streetwear/editorial furniture: corner registration crosshairs,
 *  a scrolling ticker strip, and an acid brush stroke. Purely visual. */

/** Thin electric-blue crosshair "registration marks" pinned to each corner. */
export function RegistrationMarks() {
  const Mark = ({ className }: { className: string }) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      aria-hidden
      className={`fixed z-40 text-blue ${className}`}
    >
      <path d="M11 0 V22 M0 11 H22" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </svg>
  )
  return (
    <>
      <Mark className="left-3 top-3" />
      {/* top-right corner is reserved for the theme toggle */}
      <Mark className="bottom-3 left-3" />
      <Mark className="bottom-3 right-3" />
    </>
  )
}

/** Acid brush stroke — a painted highlight behind/under text. */
export function BrushStroke({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 28" preserveAspectRatio="none" aria-hidden className={className}>
      <path
        d="M3 16 C 30 6, 55 22, 90 12 S 150 4, 180 14 C 190 17, 196 12, 198 11 L 197 20 C 160 26, 120 18, 80 23 S 25 26, 4 22 Z"
        className="fill-acid"
      />
    </svg>
  )
}
