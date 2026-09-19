import type { HTMLAttributes, ReactNode } from 'react'

type StatSize = 'md' | 'lg'

export type StatTone =
  | 'rosewater'
  | 'flamingo'
  | 'pink'
  | 'mauve'
  | 'red'
  | 'maroon'
  | 'peach'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'sky'
  | 'sapphire'
  | 'blue'
  | 'lavender'

// lg is the hero treatment: no rule above it, and a much larger value
const frame: Record<StatSize, string> = {
  md: 'pt-4 border-t border-ui',
  lg: '',
}

const valueSize: Record<StatSize, string> = {
  md: 'text-[28px] leading-[34px]',
  lg: 'text-[clamp(26px,2.3vw,38px)] leading-[1.16]',
}

// Spelled out rather than interpolated, so Tailwind's scanner can see them
const toneText: Record<StatTone, string> = {
  rosewater: 'text-rosewater',
  flamingo: 'text-flamingo',
  pink: 'text-pink',
  mauve: 'text-mauve',
  red: 'text-red',
  maroon: 'text-maroon',
  peach: 'text-peach',
  yellow: 'text-yellow',
  green: 'text-green',
  teal: 'text-teal',
  sky: 'text-sky',
  sapphire: 'text-sapphire',
  blue: 'text-blue',
  lavender: 'text-lavender',
}

type StatProps = HTMLAttributes<HTMLDivElement> & {
  value: ReactNode
  label: ReactNode
  hint?: ReactNode
  size?: StatSize
  /** A named palette slot. Defaults to the site accent */
  tone?: StatTone
}

export function Stat({
  value,
  label,
  hint,
  size = 'md',
  tone,
  className = '',
  ...rest
}: StatProps) {
  return (
    <div {...rest} className={`pb-4 ${frame[size]} ${className}`}>
      <div
        className={`type-display ${valueSize[size]} ${tone ? toneText[tone] : 'text-accent'}`}
      >
        {value}
      </div>
      <div className="mt-1 type-label fg-subtle">{label}</div>
      {hint && <div className="mt-0.5 type-meta fg-muted">{hint}</div>}
    </div>
  )
}

type StatsProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Stats({ children, className = '', ...rest }: StatsProps) {
  return (
    <div
      {...rest}
      className={`grid gap-6 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] ${className}`}
    >
      {children}
    </div>
  )
}
