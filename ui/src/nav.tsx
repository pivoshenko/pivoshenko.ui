'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Logo } from './logo'

export type NavLink = {
  href: string
  label: string
  external?: boolean
}

type NavProps = {
  brand: string
  links?: NavLink[]
  logo?: ReactNode
}

export function Nav({ brand, links = [], logo }: NavProps) {
  const pathname = usePathname()

  return (
    <header className="w-full border-b border-ui">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="type-logo fg-primary hover:opacity-60 transition-opacity inline-flex items-center gap-2"
        >
          {logo ?? <Logo />}
          {brand}
        </Link>

        <div className="flex items-center gap-3">
          {links.map((link) => {
            if (link.external) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-ui px-2 py-1 rounded fg-subtle hover-primary transition-colors"
                >
                  {link.label}
                </a>
              )
            }
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`type-ui px-3 py-1.5 rounded transition-colors ${
                  isActive ? 'fg-primary' : 'fg-subtle hover-primary'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
