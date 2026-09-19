import type { ReactNode } from 'react'
import type { AccentName } from '../palette'
import { Field, type FieldKind } from './field'

type HeroProps = {
  children: ReactNode
  /** Drop the field on a page where the hero is mostly text */
  pattern?: boolean
  field?: FieldKind
  /** Palette slot the field's lit cells take; defaults to the site accent */
  tint?: AccentName
  /** Let the field answer the cursor. On by default - it is the page's one toy */
  interactive?: boolean
  className?: string
}

export function Hero({
  children,
  pattern = true,
  field = 'contours',
  tint,
  interactive = true,
  className = '',
}: HeroProps) {
  return (
    <section className={`relative w-full overflow-hidden py-8 ${className}`}>
      {/* The radial mask the source system uses fades the field away from the
          left edge; a hero band wants its full width, and a vertical fade so
          the field dissolves into the page instead of ending on a seam */}
      {pattern && (
        <Field
          kind={field}
          mask="bottom"
          tint={tint}
          interactive={interactive}
        />
      )}
      {/* pointer-events-none so the field below stays interactive; the
          content re-enables it on whatever actually needs a cursor */}
      <div className="relative mx-auto w-full max-w-6xl px-6 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        {children}
      </div>
    </section>
  )
}
