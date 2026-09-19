export type SubHeaderTone = 'accent' | 'info' | 'success' | 'warning' | 'danger'

const toneSlash: Record<SubHeaderTone, string> = {
  accent: 'text-accent',
  info: 'text-accent-info',
  success: 'text-accent-success',
  warning: 'text-accent-warning',
  danger: 'text-accent-danger',
}

type SubHeaderProps = {
  label: string
  count?: number
  tone?: SubHeaderTone
  className?: string
}

// the slash takes a role colour here, not the site accent: a section heading
// and the sub-heading under it should not read as the same rank
export function SubHeader({
  label,
  count,
  tone = 'info',
  className = '',
}: SubHeaderProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="type-label fg-subtle">
        <span aria-hidden="true" className={toneSlash[tone]}>
          {'//'}
        </span>{' '}
        {label}
      </span>
      {count != null && (
        <span className="type-meta fg-muted bg-bg-raised rounded-full px-1.5 leading-[18px]">
          {count}
        </span>
      )}
      <span aria-hidden="true" className="rule-dashed h-px flex-1" />
    </div>
  )
}
