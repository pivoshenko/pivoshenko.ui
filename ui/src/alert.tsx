import type { ReactNode } from 'react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

type AlertProps = {
  variant: AlertVariant
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const accent: Record<AlertVariant, string> = {
  info: 'text-morok-blue',
  success: 'text-morok-green',
  warning: 'text-morok-peach',
  error: 'text-morok-red',
}

export function Alert({
  variant,
  title,
  icon,
  children,
  className = '',
}: AlertProps) {
  const tone = accent[variant]
  return (
    <div
      role="alert"
      className={`flex gap-3 bg-white dark:bg-stone-950 border border-ui rounded px-3 py-2 font-mono text-sm fg-secondary ${className}`}
    >
      {icon ? (
        <span className={`flex-shrink-0 mt-0.5 ${tone}`}>{icon}</span>
      ) : null}
      <div className="flex-1">
        {title ? <strong className={tone}>{title}</strong> : null}
        {title ? <span> </span> : null}
        {children}
      </div>
    </div>
  )
}
