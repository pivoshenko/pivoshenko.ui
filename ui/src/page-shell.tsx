import type { ReactNode } from 'react'
import { Footer, type FooterLink } from './footer'
import { Nav, type NavLink } from './nav'

type PageShellProps = {
  brand: string
  navLinks?: NavLink[]
  footerExtras?: FooterLink[]
  children: ReactNode
}

export function PageShell({
  brand,
  navLinks,
  footerExtras,
  children,
}: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav brand={brand} links={navLinks} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
      <Footer extras={footerExtras} />
    </div>
  )
}
