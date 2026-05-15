import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  count?: number
  note?: ReactNode
}

export function SectionHeader({ title, count, note }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline gap-2 border-b border-ui pb-2">
      <span className="type-label fg-subtle">──</span>
      <h2 className="type-label fg-primary">{title}</h2>
      {typeof count === 'number' && (
        <span className="type-meta fg-muted">({count})</span>
      )}
      {note && <span className="type-meta fg-muted ml-auto">{note}</span>}
    </div>
  )
}
