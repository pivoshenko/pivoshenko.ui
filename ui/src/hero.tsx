import type { ReactNode } from 'react'
import { Contours } from './contours'

type HeroProps = {
  children: ReactNode
  /** Drop the contour field on a page where the hero is mostly text */
  pattern?: boolean
  /** Let the field answer the cursor. On by default - it is the page's one toy */
  interactive?: boolean
  className?: string
}

export function Hero({
  children,
  pattern = true,
  interactive = true,
  className = '',
}: HeroProps) {
  return (
    <section className={`relative w-full overflow-hidden py-8 ${className}`}>
      {/* The radial mask the source system uses fades the field away from the
          left edge; a hero band wants its full width, and a vertical fade so
          the field dissolves into the page instead of ending on a seam */}
      {pattern && (
        <Contours
          mask="bottom"
          levels={10}
          cell={16}
          speed={0.5}
          opacity={0.55}
          seed={7}
          interactive={interactive}
        />
      )}
      {/* pointer-events-none so the contour field below stays interactive; the
          content re-enables it on whatever actually needs a cursor */}
      <div className="relative mx-auto w-full max-w-6xl px-6 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        {children}
      </div>
    </section>
  )
}
