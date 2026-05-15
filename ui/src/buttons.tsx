import type { ButtonHTMLAttributes, ReactNode } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function IconButton({
  active,
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  const state = active ? 'fg-primary' : 'fg-muted hover-secondary'
  return (
    <button
      type="button"
      {...rest}
      className={`w-8 h-8 inline-flex items-center justify-center border border-ui rounded bg-stone-50 dark:bg-black ${state} disabled:opacity-40 transition-colors ${className}`}
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
  const tone = copied ? 'text-morok-green' : 'fg-muted hover-secondary'
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center gap-1.5 border border-ui rounded px-2 py-1 font-mono text-xs ${tone} transition-colors ${className}`}
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
      className={`font-mono text-sm bg-transparent border-0 p-0 fg-subtle hover-secondary transition-colors ${className}`}
    >
      {children}
    </button>
  )
}
