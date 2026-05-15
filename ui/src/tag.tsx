import type { ButtonHTMLAttributes, ReactNode } from 'react'

type TagProps = {
  children: ReactNode
  active?: boolean
  className?: string
}

export function Tag({ children, active, className = '' }: TagProps) {
  const tone = active ? 'bg-tag-active fg-secondary' : 'bg-tag fg-muted'
  return (
    <span
      className={`inline-flex items-center font-mono text-xs px-1.5 py-0.5 rounded ${tone} ${className}`}
    >
      {children}
    </span>
  )
}

type TagButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function TagButton({
  active,
  className = '',
  children,
  ...rest
}: TagButtonProps) {
  const tone = active
    ? 'bg-tag-active fg-secondary'
    : 'bg-tag fg-muted hover-secondary'
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center font-mono text-xs px-1.5 py-0.5 rounded transition-colors ${tone} ${className}`}
    >
      {children}
    </button>
  )
}
