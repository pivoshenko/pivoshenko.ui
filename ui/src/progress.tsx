type ProgressBarProps = {
  value: number
  className?: string
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      tabIndex={-1}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={`h-px w-full bg-bg-raised ${className}`}
    >
      <div
        className="h-px bg-fg-default transition-[width] duration-150"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
