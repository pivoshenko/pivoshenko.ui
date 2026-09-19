import type { ReactNode } from 'react'
import { Footer, type FooterLink } from './footer'
import { Nav, type NavLink } from './nav'
import { ScrollToTop } from './scroll-to-top'

type PageShellProps = {
  brand: string
  navLinks?: NavLink[]
  footerExtras?: FooterLink[]
  /** Full-bleed band between the header and the content well */
  hero?: ReactNode
  children: ReactNode
}

export function PageShell({
  brand,
  navLinks,
  footerExtras,
  hero,
  children,
}: PageShellProps) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Nav brand={brand} links={navLinks} />
        {hero}
        <main
          className={`mx-auto w-full max-w-6xl flex-1 px-6 pb-10 ${hero ? 'pt-4' : 'pt-8'}`}
        >
          {children}
        </main>
        <Footer extras={footerExtras} />
      </div>
      <ScrollToTop />
    </>
  )
}
