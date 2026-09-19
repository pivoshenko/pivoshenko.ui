'use client'

import { Check, ChevronDown } from 'lucide-react'
import type { AriaRole, HTMLAttributes, ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

type MenuAlign = 'start' | 'end'

const panelAlign: Record<MenuAlign, string> = {
  start: 'left-0',
  end: 'right-0',
}

// items are found by attribute rather than by ref, so a caller can nest them
// inside their own wrappers and roving focus still reaches them
const ITEM = '[data-menu-item]:not([disabled])'

const MenuClose = createContext<() => void>(() => {})

type MenuProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode
  icon?: ReactNode
  align?: MenuAlign
  children: ReactNode
}

export function Menu({
  label,
  icon,
  align = 'start',
  className = '',
  children,
  ...rest
}: MenuProps) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    trigger.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return

    const items = () =>
      Array.from(wrap.current?.querySelectorAll<HTMLElement>(ITEM) ?? [])

    const away = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false)
    }

    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        return
      }
      const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
      if (!keys.includes(event.key)) return
      const els = items()
      if (!els.length) return
      event.preventDefault()
      const at = els.indexOf(document.activeElement as HTMLElement)
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? els.length - 1
            : event.key === 'ArrowDown'
              ? (at + 1) % els.length
              : at <= 0
                ? els.length - 1
                : at - 1
      els[next]?.focus()
    }

    document.addEventListener('pointerdown', away, true)
    document.addEventListener('keydown', key)
    items()[0]?.focus()

    return () => {
      document.removeEventListener('pointerdown', away, true)
      document.removeEventListener('keydown', key)
    }
  }, [open, close])

  return (
    <div ref={wrap} {...rest} className={`relative inline-block ${className}`}>
      <button
        type="button"
        ref={trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((was) => !was)}
        className="group inline-flex items-center gap-2 h-8 px-3 border border-card rounded-md bg-bg-sunken text-fg-default font-mono font-medium text-[13px] leading-5 transition-colors duration-fast hover:border-border-strong aria-expanded:border-accent focus-ring"
      >
        {icon ? (
          <span aria-hidden="true" className="inline-flex text-accent shrink-0">
            {icon}
          </span>
        ) : null}
        <span>{label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0 fg-muted transition-transform duration-base ease-out group-aria-expanded:rotate-180 motion-reduce:transition-none"
        />
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute top-[calc(100%+6px)] ${panelAlign[align]} z-20 min-w-[180px] max-h-[280px] overflow-y-auto p-1 surface-card rounded-md shadow-float animate-menu-in motion-reduce:animate-none`}
        >
          <MenuClose.Provider value={close}>{children}</MenuClose.Provider>
        </div>
      ) : null}
    </div>
  )
}

type MenuItemTone = 'danger'

const itemTone: Record<MenuItemTone, string> = {
  danger: 'text-accent-danger',
}

type MenuItemProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children: ReactNode
  href?: string
  selected?: boolean
  disabled?: boolean
  tone?: MenuItemTone
  icon?: ReactNode
  meta?: ReactNode
}

export function MenuItem({
  children,
  href,
  selected,
  disabled,
  tone,
  icon,
  meta,
  className = '',
  onClick,
  ...rest
}: MenuItemProps) {
  const close = useContext(MenuClose)
  // one colour class only - Tailwind emits text-fg-default ahead of
  // text-fg-muted, so stacking them would lose the selected state
  const resting = tone
    ? itemTone[tone]
    : selected
      ? 'text-fg-default'
      : 'text-fg-muted'
  const state = disabled
    ? 'text-fg-faint cursor-not-allowed'
    : `${resting} cursor-pointer hover:bg-bg-raised hover:text-fg-default`
  const classes = `flex items-center gap-2 w-full px-2 py-1.5 border-0 rounded-sm bg-transparent font-mono text-[13px] leading-5 text-left no-underline focus-ring ${state} ${className}`

  const body = (
    <>
      {selected === undefined ? null : (
        <span
          aria-hidden="true"
          className="w-3 shrink-0 inline-flex text-accent"
        >
          {selected ? <Check size={12} strokeWidth={2} /> : null}
        </span>
      )}
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {icon}
        </span>
      ) : null}
      <span className="flex-1 min-w-0">{children}</span>
      {meta ? <span className="type-meta fg-muted">{meta}</span> : null}
    </>
  )

  const role: AriaRole = selected === undefined ? 'menuitem' : 'menuitemradio'

  if (href) {
    return (
      <a
        href={href}
        data-menu-item=""
        role={role}
        aria-checked={selected}
        {...rest}
        onClick={(event) => {
          onClick?.(event)
          close()
        }}
        className={classes}
      >
        {body}
      </a>
    )
  }

  return (
    <button
      type="button"
      disabled={disabled}
      data-menu-item=""
      role={role}
      aria-checked={selected}
      {...rest}
      onClick={(event) => {
        onClick?.(event)
        close()
      }}
      className={classes}
    >
      {body}
    </button>
  )
}

type MenuHeaderProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode }

export function MenuHeader({
  className = '',
  children,
  ...rest
}: MenuHeaderProps) {
  return (
    <div
      role="presentation"
      {...rest}
      className={`px-2 pt-2 pb-1 type-label fg-subtle ${className}`}
    >
      {children}
    </div>
  )
}

// <hr> already carries the separator role, so it needs no explicit one
type MenuSeparatorProps = HTMLAttributes<HTMLHRElement>

export function MenuSeparator({ className = '', ...rest }: MenuSeparatorProps) {
  return (
    <hr
      {...rest}
      className={`h-px my-1 border-0 bg-border-subtle ${className}`}
    />
  )
}
