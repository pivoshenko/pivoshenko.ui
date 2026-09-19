'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

type Align = 'start' | 'end'

const alignClass: Record<Align, string> = {
  start: 'left-6',
  end: 'right-6',
}

type ScrollToTopProps = {
  threshold?: number
  align?: Align
  label?: string
  className?: string
}

export function ScrollToTop({
  threshold = 240,
  align = 'end',
  label = 'Top',
  className = '',
}: ScrollToTopProps = {}) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const read = () => setShown(window.scrollY > threshold)
    read()
    window.addEventListener('scroll', read, { passive: true })
    return () => window.removeEventListener('scroll', read)
  }, [threshold])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
      aria-label="Back to top"
      aria-hidden={shown ? undefined : 'true'}
      tabIndex={shown ? 0 : -1}
      className={`fixed bottom-6 z-30 inline-flex items-center justify-center gap-2 h-9 w-9 px-0 sm:w-auto sm:px-3 border border-card rounded-md bg-bg-sunken shadow-raised fg-subtle hover-primary hover:border-accent font-mono text-xs leading-5 font-medium transition-[opacity,transform,color,border-color] duration-base ease-out motion-reduce:transition-none focus-ring ${
        alignClass[align]
      } ${
        shown
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      } ${className}`}
    >
      <ArrowUp
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="text-accent shrink-0"
      />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
