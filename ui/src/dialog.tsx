'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: ReactNode
  /** Small line above the title, typically a path or a source */
  eyebrow?: ReactNode
  glyph?: ReactNode
  children: ReactNode
  className?: string
}

// Built on the native <dialog>, so the focus trap, the inert background, the
// Escape key and the top layer all come from the platform rather than from us
export function Dialog({
  open,
  onClose,
  title,
  eyebrow,
  glyph,
  children,
  className = '',
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  // Clicking the backdrop dismisses. It is bound here rather than as an onClick
  // prop because a backdrop has no keyboard equivalent to pair with - Escape
  // already closes a native dialog, and the close button carries the focus path
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onPointer = (event: MouseEvent) => {
      if (event.target === el) onClose()
    }
    el.addEventListener('click', onPointer)
    return () => el.removeEventListener('click', onPointer)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={`dialog-panel m-auto w-[min(46rem,calc(100vw-2rem))] max-w-none border-card rounded-lg border bg-bg-surface p-0 text-fg-default shadow-float backdrop:bg-transparent open:animate-rise motion-reduce:open:animate-none ${className}`}
    >
      <div className="flex items-start gap-3 border-b border-dashed border-border-strong p-6">
        {glyph && (
          <span
            aria-hidden="true"
            className="inline-grid h-7 w-7 flex-none place-items-center rounded-sm bg-bg-raised text-accent"
          >
            {glyph}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && <div className="type-meta fg-subtle">{eyebrow}</div>}
          <h2 className="type-display fg-title m-0 mt-1 text-xl leading-7 [overflow-wrap:anywhere]">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-ring border-card fg-subtle hover-primary inline-grid h-7 w-7 flex-none cursor-pointer place-items-center rounded-sm border bg-bg-raised transition-colors duration-fast hover:border-border-strong"
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
      <div className="grid gap-4 p-6">{children}</div>
    </dialog>
  )
}
