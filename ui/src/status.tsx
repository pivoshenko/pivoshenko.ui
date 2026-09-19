import type { HTMLAttributes, ReactNode } from 'react'

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

// the chip geometry is Tag's; only the colour differs, and these variants are
// semantic states rather than the site's own accent, so they stay on the roles
const chip =
  'inline-flex items-center gap-1.5 px-2 py-0.5 border border-card rounded-sm bg-bg-raised shadow-rest font-mono font-medium text-xs leading-[18px]'

const tone: Record<StatusVariant, string> = {
  success: 'text-accent-success',
  warning: 'text-accent-warning',
  error: 'text-accent-danger',
  info: 'text-accent-info',
  neutral: 'fg-subtle',
}

type StatusBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  variant: StatusVariant
  children: ReactNode
  dot?: boolean
  className?: string
}

export function StatusBadge({
  variant,
  children,
  dot = true,
  className = '',
  ...rest
}: StatusBadgeProps) {
  return (
    <span {...rest} className={`${chip} ${tone[variant]} ${className}`}>
      {dot ? (
        <span
          aria-hidden="true"
          className="w-1.5 h-1.5 shrink-0 rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  )
}
