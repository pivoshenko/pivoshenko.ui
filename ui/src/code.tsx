'use client'

import { Check, Copy } from 'lucide-react'
import { type HTMLAttributes, type ReactNode, useEffect, useState } from 'react'

type CodeBlockProps = HTMLAttributes<HTMLElement> & {
  label?: string
  code?: string
  children?: ReactNode
  copyable?: boolean
}

export function CodeBlock({
  label,
  code = '',
  children,
  copyable = true,
  className = '',
  ...rest
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1200)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
  }

  return (
    <figure
      {...rest}
      className={`surface-sunken overflow-hidden m-0 ${className}`}
    >
      {label || copyable ? (
        <figcaption className="flex items-center justify-between gap-3 px-3 py-2 bg-bg-sunken border-b border-border-default">
          <span className="type-meta fg-subtle">{label ?? ''}</span>
          {copyable ? (
            <button
              type="button"
              onClick={copy}
              aria-live="polite"
              className="focus-ring inline-flex items-center gap-1 px-1.5 py-px rounded-sm border border-border-default text-fg-subtle font-mono text-[11px] leading-4 font-medium transition-colors duration-fast hover:text-fg-default hover:border-border-strong"
            >
              {copied ? (
                <Check size={14} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Copy size={14} strokeWidth={2} aria-hidden="true" />
              )}
              {copied ? 'copied' : 'copy'}
            </button>
          ) : null}
        </figcaption>
      ) : null}
      <pre className="m-0 p-4 overflow-x-auto text-fg-muted font-mono text-[13px] leading-5">
        <code>{children ?? code}</code>
      </pre>
    </figure>
  )
}

type InlineCodeProps = HTMLAttributes<HTMLElement>

export function InlineCode({
  className = '',
  children,
  ...rest
}: InlineCodeProps) {
  return (
    <code
      {...rest}
      className={`font-mono text-[13px] bg-bg-raised text-accent-secondary rounded-sm px-1 py-px ${className}`}
    >
      {children}
    </code>
  )
}

type KbdProps = HTMLAttributes<HTMLElement> & { children: ReactNode }

export function Kbd({ className = '', children, ...rest }: KbdProps) {
  return (
    <kbd
      {...rest}
      className={`font-mono text-xs bg-bg-raised text-fg-default border border-ui rounded-sm px-1.5 py-px ${className}`}
    >
      {children}
    </kbd>
  )
}
