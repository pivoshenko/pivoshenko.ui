import type { HTMLAttributes } from 'react'

type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value: number
  className?: string
}

export function ProgressBar({
  value,
  className = '',
  ...rest
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      tabIndex={-1}
      {...rest}
      className={`h-px w-full bg-border-default ${className}`}
    >
      <div
        className="h-px bg-accent transition-[width] duration-base ease-out motion-reduce:transition-none"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
