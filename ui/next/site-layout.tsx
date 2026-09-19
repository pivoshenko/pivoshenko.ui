import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Martian_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { type AccentName, palette } from '../palette'
import type { FieldKind } from '../src/field'
import type { FooterLink } from '../src/footer'
import type { NavLink } from '../src/nav'
import { PageShell } from '../src/page-shell'

// themeColor tracks the active palette's bg canvas. Each site re-exports this
// as `viewport` from its app/layout.tsx, which Next reads by name
export const siteViewport: Viewport = {
  themeColor: palette.bg.canvas,
}

type SiteMetadataInput = {
  url: string
  brand: string
  title: string
  titleTemplate?: string
  description: string
  siteName?: string
  ogTitle?: string
  ogDescription?: string
}

export function siteMetadata(input: SiteMetadataInput): Metadata {
  const siteName = input.siteName ?? input.brand
  const ogTitle = input.ogTitle ?? input.title
  const ogDescription = input.ogDescription ?? input.description
  return {
    metadataBase: new URL(input.url),
    title: input.titleTemplate
      ? { template: input.titleTemplate, default: input.title }
      : input.title,
    description: input.description,
    openGraph: {
      type: 'website',
      url: input.url,
      siteName,
      title: ogTitle,
      description: ogDescription,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
    },
  }
}

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

// Display face, reserved for headings and stat values. Only the weights the
// design system actually sets, so the subset stays small
const martianMono = Martian_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-martian-mono',
})

type SiteLayoutProps = {
  brand: string
  navLinks?: NavLink[]
  footerExtras?: FooterLink[]
  /** Named palette slot every `accent` utility resolves to, site-wide */
  accent?: AccentName
  /** Decorative field the hero and footer bands paint, site-wide */
  field?: FieldKind
  /** Palette slot the field's lit cells take; defaults to the site accent */
  fieldTint?: AccentName
  /** Drop the footer's field on a site that wants the band plain */
  footerPattern?: boolean
  beforeShell?: ReactNode
  afterShell?: ReactNode
  children: ReactNode
}

export function SiteLayout({
  brand,
  navLinks,
  footerExtras,
  accent = 'peach',
  field,
  fieldTint,
  footerPattern,
  beforeShell,
  afterShell,
  children,
}: SiteLayoutProps) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-accent={accent}
      className={`${jetbrainsMono.variable} ${martianMono.variable}`}
    >
      <body className="font-mono antialiased">
        {beforeShell}
        <PageShell
          brand={brand}
          navLinks={navLinks}
          footerExtras={footerExtras}
          field={field}
          tint={fieldTint}
          footerPattern={footerPattern}
        >
          {children}
        </PageShell>
        <Analytics />
        {afterShell}
      </body>
    </html>
  )
}
