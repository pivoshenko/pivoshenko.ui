import type { ReactNode } from 'react'

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

type StatusBadgeProps = {
  variant: StatusVariant
  children: ReactNode
  dot?: boolean
  className?: string
}

const tone: Record<StatusVariant, string> = {
  success: 'bg-accent-success/15 text-accent-success',
  warning: 'bg-accent-warning/15 text-accent-warning',
  error: 'bg-accent-danger/15 text-accent-danger',
  info: 'bg-accent-info/15 text-accent-info',
  neutral: 'bg-bg-raised text-fg-subtle',
}

export function StatusBadge({
  variant,
  children,
  dot = true,
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 rounded ${tone[variant]} ${className}`}
    >
      {dot ? (
        <span
          aria-hidden
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'currentColor' }}
        />
      ) : null}
      {children}
    </span>
  )
}
