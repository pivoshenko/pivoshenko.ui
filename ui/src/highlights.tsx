import type { ReactNode } from 'react'

type HighlightColumns = 2 | 3 | 4

// Spelled out rather than interpolated, so Tailwind's scanner can see them
const columnCount: Record<HighlightColumns, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
}

type HighlightsProps = {
  items: Array<{ title: string; body: ReactNode }>
  /** Prefix each item with a zero-padded ordinal in the accent */
  numbered?: boolean
  columns?: HighlightColumns
  className?: string
}

export function Highlights({
  items,
  numbered = true,
  columns = 3,
  className = '',
}: HighlightsProps) {
  return (
    <div
      className={`grid gap-x-10 gap-y-8 pt-2 ${columnCount[columns]} ${className}`}
    >
      {items.map((item, index) => (
        <div key={item.title}>
          {numbered && (
            <span aria-hidden="true" className="type-label text-accent">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
          <h3 className={`type-heading fg-title ${numbered ? 'mt-3' : ''}`}>
            {item.title}
          </h3>
          <p className="type-body fg-body mt-2">{item.body}</p>
        </div>
      ))}
    </div>
  )
}
