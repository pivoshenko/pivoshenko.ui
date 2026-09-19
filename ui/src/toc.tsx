'use client'

import type { HTMLAttributes } from 'react'
import { useEffect, useState } from 'react'

export type TocItem = {
  id: string
  label: string
  level?: 2 | 3 | 4
  count?: number
}

const indent: Record<2 | 3 | 4, string> = {
  2: 'pl-3',
  3: 'pl-6',
  4: 'pl-8',
}

// the reading line: a heading counts as current once it has passed this far
// down the viewport
const LINE = 96

type TableOfContentsProps = HTMLAttributes<HTMLElement> & {
  items: TocItem[]
  title?: string
  sticky?: boolean
}

export function TableOfContents({
  items,
  title = 'On this page',
  sticky = false,
  className = '',
  ...rest
}: TableOfContentsProps) {
  const [active, setActive] = useState<string | null>(null)
  const ids = items.map((item) => item.id).join(',')

  useEffect(() => {
    if (!ids) return
    let frame = 0

    const pick = () => {
      frame = 0
      const targets = ids
        .split(',')
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
      if (!targets.length) return

      // the last section is routinely shorter than the viewport, so it would
      // never reach the reading line on its own - the page bottom is its cue
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      if (bottom) {
        setActive(targets[targets.length - 1]?.id ?? null)
        return
      }

      let current = targets[0]?.id ?? null
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= LINE) current = el.id
      }
      setActive(current)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    pick()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  const pinned = sticky
    ? 'sticky top-[calc(56px+1.5rem)] self-start max-h-[calc(100vh-56px-3rem)] overflow-y-auto'
    : ''

  return (
    <nav
      aria-label={title}
      {...rest}
      className={`text-[13px] leading-5 ${pinned} ${className}`}
    >
      <div className="mb-3 type-label fg-subtle">
        <span aria-hidden="true" className="text-accent">
          {'//'}
        </span>{' '}
        {title}
      </div>
      <ul className="list-none m-0 p-0 border-l border-border-default">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? 'true' : undefined}
              className={`group relative flex items-center gap-2 py-1 pr-3 no-underline fg-subtle hover-primary aria-[current]:text-fg-default transition-colors duration-fast focus-ring ${indent[item.level ?? 2]}`}
            >
              <span
                aria-hidden="true"
                className="absolute -left-px top-1/2 w-px h-0 bg-accent transition-[height,top] duration-base ease-out group-aria-[current]:top-0 group-aria-[current]:h-full motion-reduce:transition-none"
              />
              <span className="flex-1 min-w-0">{item.label}</span>
              {item.count != null ? (
                <span className="tabular-nums text-overlay2">{item.count}</span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
