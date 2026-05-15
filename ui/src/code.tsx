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
      className={`font-mono text-[0.875em] bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-1.5 py-0.5 rounded ${className}`}
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
      className={`font-mono text-sm bg-stone-900 dark:bg-[#1e1e1e] text-stone-100 border border-stone-700 rounded-lg p-3 overflow-x-auto ${className}`}
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
      className={`font-mono text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-ui rounded px-1.5 py-0.5 ${className}`}
    >
      {children}
    </kbd>
  )
}
