'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { Brand } from './logo'

export type NavLink = {
  href: string
  label: string
  external?: boolean
  active?: boolean
}

type NavProps = {
  brand: string
  links?: NavLink[]
  logo?: ReactNode
  actions?: ReactNode
  sticky?: boolean
  navLabel?: string
  className?: string
}

const linkBase =
  'relative px-3 py-1.5 rounded-sm type-ui font-medium tracking-[-0.01em] no-underline transition-colors duration-fast hover:bg-bg-surface focus-ring'

// the spy line sits just under the 56px bar, so a section counts as read once
// its heading has cleared the chrome rather than when it merely peeks in
const SPY_LINE = 96

function Underline() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-3 right-3 -bottom-[13px] h-[2px] bg-accent"
    />
  )
}

export function Nav({
  brand,
  links = [],
  logo,
  actions,
  sticky = true,
  navLabel = 'Primary',
  className = '',
}: NavProps) {
  const pathname = usePathname()
  const anchorKey = links
    .filter((link) => link.href.startsWith('#'))
    .map((link) => link.href.slice(1))
    .join(',')
  const [spy, setSpy] = useState('')

  useEffect(() => {
    const ids = anchorKey ? anchorKey.split(',') : []
    if (ids.length === 0) return

    const read = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      // a final section shorter than the viewport can never reach the spy
      // line, so the bottom of the page hands it the mark outright
      if (bottom) {
        setSpy(ids[ids.length - 1] ?? '')
        return
      }
      let current = ''
      for (const id of ids) {
        const target = document.getElementById(id)
        if (target && target.getBoundingClientRect().top <= SPY_LINE) {
          current = id
        }
      }
      setSpy(current)
    }

    read()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read, { passive: true })
    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [anchorKey])

  const isCurrent = (link: NavLink) => {
    if (link.active !== undefined) return link.active
    if (link.href.startsWith('#')) return spy === link.href.slice(1)
    if (link.external) return false
    return link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
  }

  return (
    <header
      className={`relative z-10 w-full border-b border-ui ${
        sticky
          ? 'sticky top-0 bg-bg-canvas/[0.72] backdrop-blur-xl backdrop-saturate-[1.2]'
          : 'bg-bg-canvas'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 -bottom-px h-px w-24 bg-accent"
      />
      <div className="max-w-6xl mx-auto h-14 flex items-center gap-3 px-4 sm:gap-6 sm:px-6">
        {logo ?? <Brand name={brand} />}

        <nav
          aria-label={navLabel}
          className="flex items-center gap-0.5 ml-auto"
        >
          {links.map((link) => {
            const current = isCurrent(link)

            if (link.external || link.href.startsWith('#')) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={current ? 'page' : undefined}
                  {...(link.external && {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  })}
                  className={`${linkBase} ${current ? 'fg-primary' : 'fg-subtle hover-primary'}`}
                >
                  {link.label}
                  {current ? <Underline /> : null}
                </a>
              )
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? 'page' : undefined}
                className={`${linkBase} ${current ? 'fg-primary' : 'fg-subtle hover-primary'}`}
              >
                {link.label}
                {current ? <Underline /> : null}
              </Link>
            )
          })}
        </nav>

        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  )
}
