import type { ReactNode } from 'react'

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

type StatusBadgeProps = {
  variant: StatusVariant
  children: ReactNode
  dot?: boolean
  className?: string
}

const tone: Record<StatusVariant, string> = {
  success: 'bg-morok-green/15 text-[#6f8a6d] dark:text-morok-green',
  warning: 'bg-morok-peach/15 text-[#a17849] dark:text-morok-peach',
  error: 'bg-morok-red/15 text-[#b06a6a] dark:text-morok-red',
  info: 'bg-morok-blue/15 text-[#6383ad] dark:text-morok-lavender',
  neutral:
    'bg-stone-100 text-stone-500 dark:bg-stone-800/70 dark:text-stone-400',
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
