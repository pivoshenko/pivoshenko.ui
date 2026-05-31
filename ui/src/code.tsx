import type { HTMLAttributes, ReactNode } from 'react'

type InlineCodeProps = HTMLAttributes<HTMLElement>

export function InlineCode({
  className = '',
  children,
  ...rest
}: InlineCodeProps) {
  return (
    <code
      {...rest}
      className={`font-mono text-[0.875em] bg-bg-raised text-fg-default px-1.5 py-0.5 rounded ${className}`}
    >
      {children}
    </code>
  )
}

type CodeBlockProps = HTMLAttributes<HTMLPreElement>

export function CodeBlock({
  className = '',
  children,
  ...rest
}: CodeBlockProps) {
  return (
    <pre
      {...rest}
      className={`font-mono text-sm bg-bg-sunken text-fg-default border border-border-strong rounded-lg p-3 overflow-x-auto ${className}`}
    >
      {children}
    </pre>
  )
}

type KbdProps = HTMLAttributes<HTMLElement> & { children: ReactNode }

export function Kbd({ className = '', children, ...rest }: KbdProps) {
  return (
    <kbd
      {...rest}
      className={`font-mono text-xs bg-bg-raised text-fg-default border border-ui rounded px-1.5 py-0.5 ${className}`}
    >
      {children}
    </kbd>
  )
}
