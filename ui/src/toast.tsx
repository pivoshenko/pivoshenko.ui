import type { OutputHTMLAttributes, ReactNode } from 'react'

type ToastProps = Omit<OutputHTMLAttributes<HTMLElement>, 'children'> & {
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Toast({ icon, children, className = '', ...rest }: ToastProps) {
  return (
    <output
      {...rest}
      className={`inline-flex items-center gap-2 px-4 py-3 border border-card rounded-md bg-bg-surface shadow-rest font-mono text-sm leading-relaxed fg-body ${className}`}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0 inline-flex text-accent">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </output>
  )
}
