import type { ReactNode } from 'react'

type TooltipProps = {
  label: string
  children: ReactNode
  className?: string
}

/**
 * CSS-only tooltip: visible on hover or focus of the wrapped trigger.
 * Uses group-* selectors on the wrapper, so no client JS is needed.
 */
export function Tooltip({ label, children, className = '' }: TooltipProps) {
  return (
    <span className={`relative inline-flex group ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-fg-default text-bg-canvas font-mono text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
      >
        {label}
      </span>
    </span>
  )
}
