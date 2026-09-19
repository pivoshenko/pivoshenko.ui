import { ChevronRight } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'

type TerminalLine = { cmd: string } | { out: string; tone?: 'ok' | 'dim' }

const lights = ['bg-red', 'bg-yellow', 'bg-green']

const outTone: Record<'ok' | 'dim', string> = {
  ok: 'text-accent-success',
  dim: 'text-overlay2',
}

type TerminalWindowProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  lines?: TerminalLine[]
  children?: ReactNode
}

export function TerminalWindow({
  title = '~',
  lines = [],
  children,
  className = '',
  ...rest
}: TerminalWindowProps) {
  return (
    <div
      {...rest}
      className={`border border-card rounded-lg bg-crust overflow-hidden text-[13px] leading-5 shadow-raised ${className}`}
    >
      <div className="flex items-center gap-1.5 px-3 py-2 bg-bg-sunken border-b border-border-default">
        {lights.map((light) => (
          <span
            key={light}
            aria-hidden="true"
            className={`w-2.5 h-2.5 rounded-full ${light}`}
          />
        ))}
        <span className="ml-2 text-fg-subtle text-xs">{title}</span>
      </div>
      <pre className="m-0 p-4 font-mono fg-body whitespace-pre-wrap">
        {lines.map((line, index) =>
          'cmd' in line ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: a transcript is positional, so the index is the only stable identity
            <div key={index}>
              <ChevronRight
                size={12}
                strokeWidth={2}
                aria-hidden="true"
                className="inline-block align-middle text-accent"
              />{' '}
              <span className="text-fg-default">{line.cmd}</span>
            </div>
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: a transcript is positional, so the index is the only stable identity
            <div key={index} className={line.tone ? outTone[line.tone] : ''}>
              {line.out}
            </div>
          ),
        )}
        {children}
      </pre>
    </div>
  )
}
