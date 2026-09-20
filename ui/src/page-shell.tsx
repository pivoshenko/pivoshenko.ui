import type { HTMLAttributes, ReactNode } from 'react'
import type { AccentName } from '../palette'
import type { FieldKind } from './field'
import { Footer, type FooterLink } from './footer'
import { Nav, type NavLink } from './nav'
import { ScrollToTop } from './scroll-to-top'

type PageShellProps = {
  brand: string
  navLinks?: NavLink[]
  footerExtras?: FooterLink[]
  field?: FieldKind
  tint?: AccentName
  /** Only `chunks` and `waves` honour this */
  tintAlt?: AccentName
  /** Drop the footer's field on a site that wants the band plain */
  footerPattern?: boolean
  /** Drop the footer's website link where it would point at the site itself */
  footerWebsite?: boolean
  children: ReactNode
}

// `main` carries no width of its own, so a page can alternate full-bleed bands
// (Hero, a canvas) with constrained ones (PageBody) without fighting a wrapper
export function PageShell({
  brand,
  navLinks,
  footerExtras,
  field,
  tint,
  tintAlt,
  footerPattern = true,
  footerWebsite = true,
  children,
}: PageShellProps) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Nav brand={brand} links={navLinks} />
        <main className="w-full flex-1">{children}</main>
        <Footer
          extras={footerExtras}
          field={field}
          tint={tint}
          tintAlt={tintAlt}
          pattern={footerPattern}
          website={footerWebsite}
        />
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
