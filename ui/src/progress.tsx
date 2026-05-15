type ProgressBarProps = {
  value: number
  className?: string
}

/**
 * Reading-progress strip. Renders a 1px-tall bar; the filled portion uses
 * stone-900 on light and stone-100 on dark to match the brand grayscale.
 */
export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      tabIndex={-1}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={`h-px w-full bg-stone-200 dark:bg-stone-800 ${className}`}
    >
      <div
        className="h-px bg-stone-900 dark:bg-stone-100 transition-[width] duration-150"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
