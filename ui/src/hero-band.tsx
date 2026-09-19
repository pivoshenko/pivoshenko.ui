import type { ReactNode } from 'react'
import type { AccentName } from '../palette'
import type { FieldKind } from './field'
import { Hero } from './hero'
import { Stat, type StatTone, Stats } from './stat'

type HeroBandProps = {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  counters?: Array<{ label: string; value: ReactNode }>
  /** A named palette slot for the counter values. Defaults to the site accent */
  tone?: StatTone
  children?: ReactNode
  pattern?: boolean
  field?: FieldKind
  tint?: AccentName
  className?: string
}

export function HeroBand({
  eyebrow,
  title,
  lead,
  counters = [],
  tone,
  children,
  pattern = true,
  field,
  tint,
  className = '',
}: HeroBandProps) {
  return (
    <Hero pattern={pattern} field={field} tint={tint} className={className}>
      {eyebrow && (
        <p className="type-label fg-subtle">
          <span aria-hidden="true" className="text-accent">
            {'//'}
          </span>{' '}
          {eyebrow}
        </p>
      )}

      <h1
        className={`type-display text-2xl leading-tight sm:text-3xl ${eyebrow ? 'mt-3' : ''}`}
      >
        {title}
      </h1>

      {lead && <p className="type-body fg-primary mt-4 text-base">{lead}</p>}

      {children}

      {counters.length > 0 && (
        <Stats className="mt-8 justify-items-center text-center">
          {counters.map(({ label, value }) => (
            <Stat
              key={label}
              size="lg"
              tone={tone}
              value={value}
              label={label}
            />
          ))}
        </Stats>
      )}
    </Hero>
  )
}
