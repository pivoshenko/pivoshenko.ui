import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

// Tab borrows the nav rail's treatment: a rounded hover pill, and the selected
// underline pinned to the tablist's own bottom rule, inset by the tab padding
const tab =
  'relative px-3 py-1.5 rounded-sm font-mono text-sm leading-5 font-medium tracking-[-0.01em] transition-colors duration-fast hover:bg-bg-surface focus-ring'

// Segment borrows the menu trigger: a 32px sunken bar split by hairlines
const segment =
  'h-8 px-3 bg-transparent font-mono font-medium text-[13px] leading-5 border-l border-card first:border-l-0 transition-colors duration-fast focus-ring'

type TabsProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  className?: string
}

export function Tabs({ children, className = '', ...rest }: TabsProps) {
  return (
    <div
      role="tablist"
      {...rest}
      className={`flex items-center gap-0.5 border-b border-ui ${className}`}
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
      className={`${tab} ${active ? 'fg-primary' : 'fg-subtle hover-primary'} ${className}`}
    >
      {children}
      {active ? (
        <span
          aria-hidden="true"
          className="absolute left-3 right-3 -bottom-px h-[2px] bg-accent"
        />
      ) : null}
    </button>
  )
}

type SegmentProps = HTMLAttributes<HTMLFieldSetElement> & {
  children: ReactNode
  className?: string
}

export function Segment({ children, className = '', ...rest }: SegmentProps) {
  return (
    <fieldset
      {...rest}
      className={`inline-flex items-center h-8 p-0 m-0 border border-card rounded-md bg-bg-sunken overflow-hidden ${className}`}
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
      aria-pressed={active}
      {...rest}
      className={`${segment} ${
        active ? 'bg-bg-raised fg-primary' : 'fg-subtle hover-primary'
      } ${className}`}
    >
      {children}
    </button>
  )
}
