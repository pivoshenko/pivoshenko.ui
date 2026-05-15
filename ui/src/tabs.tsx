import type { ButtonHTMLAttributes, ReactNode } from 'react'

type TabsProps = {
  children: ReactNode
  className?: string
}

export function Tabs({ children, className = '' }: TabsProps) {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-4 border-b border-ui ${className}`}
    >
      {children}
    </div>
  )
}

type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function Tab({ active, className = '', children, ...rest }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      {...rest}
      className={`relative font-mono text-sm py-2 transition-colors ${
        active ? 'fg-primary' : 'fg-subtle hover-secondary'
      } ${className}`}
    >
      {children}
      {active ? (
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-px bg-morok-blue dark:bg-morok-lavender"
        />
      ) : null}
    </button>
  )
}

type SegmentProps = {
  children: ReactNode
  className?: string
}

export function Segment({ children, className = '' }: SegmentProps) {
  return (
    <fieldset
      className={`inline-flex border border-ui rounded overflow-hidden p-0 m-0 ${className}`}
    >
      {children}
    </fieldset>
  )
}

type SegmentButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function SegmentButton({
  active,
  className = '',
  children,
  ...rest
}: SegmentButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`bg-transparent font-mono text-xs px-3 py-1 border-l border-ui first:border-l-0 transition-colors ${
        active ? 'fg-primary' : 'fg-subtle hover-secondary'
      } ${className}`}
    >
      {children}
    </button>
  )
}
