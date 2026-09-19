import type { HTMLAttributes, ReactNode } from 'react'

type EmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  ...rest
}: EmptyStateProps) {
  return (
    <div
      {...rest}
      className={`grid justify-items-center gap-2 px-6 py-12 border border-dashed border-border-strong rounded-lg text-center ${className}`}
    >
      {icon && (
        <span aria-hidden="true" className="text-accent leading-none">
          {icon}
        </span>
      )}
      <p className="m-0 type-ui font-semibold fg-title">{title}</p>
      {description && (
        <p className="m-0 max-w-[46ch] fg-subtle text-[13px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
