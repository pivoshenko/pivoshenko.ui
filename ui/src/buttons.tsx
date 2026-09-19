import { ArrowRight } from 'lucide-react'
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'

// == Arrow Link ==

type ArrowLinkVariant = 'text' | 'solid' | 'outline'

const linkVariant: Record<ArrowLinkVariant, string> = {
  text: 'fg-subtle hover-primary',
  solid:
    'px-4 py-2 rounded-md bg-fg-default text-bg-canvas font-semibold hover:bg-accent',
  outline:
    'px-4 py-[7px] rounded-md border border-border-strong bg-bg-canvas text-fg-default hover:border-accent',
}

// the solid pill has no room for a second colour, so its arrow takes the
// button's own foreground instead of the accent
const linkArrow: Record<ArrowLinkVariant, string> = {
  text: 'text-accent',
  solid: 'text-current',
  outline: 'text-accent',
}

type ArrowLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  variant?: ArrowLinkVariant
}

export function ArrowLink({
  children,
  variant = 'text',
  className = '',
  ...rest
}: ArrowLinkProps) {
  return (
    <a
      {...rest}
      className={`group inline-flex items-center gap-2 font-mono text-[13px] leading-5 no-underline transition-colors duration-fast focus-ring ${linkVariant[variant]} ${className}`}
    >
      <span>{children}</span>
      <ArrowRight
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className={`shrink-0 transition-transform duration-base ease-out group-hover:translate-x-1 motion-reduce:transition-none ${linkArrow[variant]}`}
      />
    </a>
  )
}

// == Buttons ==

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function IconButton({
  active,
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  const state = active
    ? 'fg-primary border-accent'
    : 'fg-subtle hover-primary hover:border-border-strong'
  return (
    <button
      type="button"
      {...rest}
      className={`w-8 h-8 inline-flex items-center justify-center border border-card rounded-md bg-bg-sunken transition-colors duration-fast disabled:opacity-40 disabled:cursor-not-allowed focus-ring ${state} ${className}`}
    >
      {children}
    </button>
  )
}

type CopyPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  copied?: boolean
}

export function CopyPill({
  copied,
  className = '',
  children,
  ...rest
}: CopyPillProps) {
  const tone = copied
    ? 'text-accent border-accent'
    : 'fg-subtle hover-primary hover:border-border-strong'
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center gap-1.5 px-1.5 py-px border border-ui rounded-sm bg-transparent font-mono font-medium text-[11px] leading-4 transition-colors duration-fast focus-ring ${tone} ${className}`}
    >
      {children}
    </button>
  )
}

type TextButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export function TextButton({
  className = '',
  children,
  ...rest
}: TextButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center gap-2 p-0 border-0 bg-transparent font-mono text-[13px] leading-5 fg-subtle hover-primary transition-colors duration-fast disabled:opacity-40 focus-ring ${className}`}
    >
      {children}
    </button>
  )
}
