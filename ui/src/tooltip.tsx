import type { HTMLAttributes, ReactNode } from 'react'

type TooltipProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  label: string
  children: ReactNode
  className?: string
}

/**
 * CSS-only tooltip: visible on hover or focus of the wrapped trigger.
 * Uses group-* selectors on the wrapper, so no client JS is needed.
 */
export function Tooltip({
  label,
  children,
  className = '',
  ...rest
}: TooltipProps) {
  return (
    <span {...rest} className={`relative inline-flex group ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 px-2 py-1 surface-card rounded-md shadow-float type-meta fg-body whitespace-nowrap opacity-0 translate-y-1 transition-[opacity,transform] duration-fast ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 motion-reduce:transition-none motion-reduce:translate-y-0"
      >
        {label}
      </span>
    </span>
  )
}
