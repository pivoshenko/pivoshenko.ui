'use client'

import { type ButtonHTMLAttributes, useEffect, useState } from 'react'

type SwatchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> & {
  name: string
  value: string
  token?: string
}

export function Swatch({
  name,
  value,
  token,
  className = '',
  ...rest
}: SwatchProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1200)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = () => {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(true)
  }

  // tokens are R G B triples, so a variable has to be composed into a colour
  const cssVar = token?.startsWith('--') ? token : `--${token}`
  const chip = token ? `rgb(var(${cssVar}))` : value

  return (
    <button
      {...rest}
      type="button"
      onClick={copy}
      aria-label={`Copy ${name} ${value}`}
      className={`group focus-ring flex flex-col min-w-0 p-0 text-left overflow-hidden border border-card rounded-md bg-bg-surface shadow-rest text-fg-default transition-[transform,border-color] duration-base ease-out hover:-translate-y-0.5 hover:border-overlay1 hover:shadow-lifted motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${className}`}
    >
      <span
        aria-hidden="true"
        style={{ background: chip }}
        className="h-[72px] transition-[height] duration-base ease-out group-hover:h-20"
      />
      <span className="flex justify-between gap-2 px-3 py-2 mt-auto">
        <span className="text-xs leading-4 font-semibold">{name}</span>
        <span
          aria-live="polite"
          className={`text-[11px] leading-4 uppercase ${copied ? 'text-accent-success' : 'text-fg-subtle'}`}
        >
          {copied ? 'copied' : value}
        </span>
      </span>
    </button>
  )
}
