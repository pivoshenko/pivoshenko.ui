import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  id?: string
  count?: number
  level?: 2 | 3 | 4
  action?: ReactNode
  note?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  id,
  count,
  level = 2,
  action,
  note,
  className = '',
}: SectionHeaderProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4'

  return (
    <div id={id} className={`flex items-center gap-3 mb-4 ${className}`}>
      <Heading className="m-0 type-display text-lg fg-title">
        <span aria-hidden="true" className="tracking-normal text-accent">
          {'//'}
        </span>{' '}
        {title}
      </Heading>
      {count != null && (
        <span className="px-1.5 rounded-full bg-bg-raised fg-subtle text-[11px] leading-[18px]">
          {count}
        </span>
      )}
      <span aria-hidden="true" className="rule-dashed flex-1 h-px" />
      {note && <span className="flex-none type-meta fg-muted">{note}</span>}
      {action && <span className="flex-none">{action}</span>}
    </div>
  )
}
