import type { ReactNode } from 'react'

type ToastProps = {
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Toast({ icon, children, className = '' }: ToastProps) {
  return (
    <output
      className={`inline-flex items-center gap-2 bg-white dark:bg-stone-950 border border-ui rounded px-3 py-2 font-mono text-sm fg-secondary ${className}`}
    >
      {icon ? (
        <span className="flex-shrink-0 text-morok-green">{icon}</span>
      ) : null}
      <span>{children}</span>
    </output>
  )
}
