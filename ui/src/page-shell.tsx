import type { HTMLAttributes, ReactNode } from 'react'
import { Footer, type FooterLink } from './footer'
import { Nav, type NavLink } from './nav'
import { ScrollToTop } from './scroll-to-top'

type PageShellProps = {
  brand: string
  navLinks?: NavLink[]
  footerExtras?: FooterLink[]
  children: ReactNode
}

// `main` carries no width of its own, so a page can alternate full-bleed bands
// (Hero, a canvas) with constrained ones (PageBody) without fighting a wrapper
export function PageShell({
  brand,
  navLinks,
  footerExtras,
  children,
}: PageShellProps) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Nav brand={brand} links={navLinks} />
        <main className="w-full flex-1">{children}</main>
        <Footer extras={footerExtras} />
      </div>
      <ScrollToTop />
    </>
  )
}

type PageBodyProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function PageBody({ children, className = '', ...rest }: PageBodyProps) {
  return (
    <div
      {...rest}
      className={`mx-auto w-full max-w-6xl px-6 pb-10 pt-4 ${className}`}
    >
      {children}
    </div>
  )
}
