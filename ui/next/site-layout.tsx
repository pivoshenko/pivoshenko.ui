import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import type { FooterLink } from '../src/footer'
import type { NavLink } from '../src/nav'
import { PageShell } from '../src/page-shell'
import { palette } from '../palette'

// Shared viewport — themeColor tracks the active palette's bg canvas.
// Each site re-exports as `viewport` from its app/layout.tsx (Next reads
// the symbol by name).
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

type SiteLayoutProps = {
  brand: string
  navLinks?: NavLink[]
  footerExtras?: FooterLink[]
  beforeShell?: ReactNode
  afterShell?: ReactNode
  children: ReactNode
}

export function SiteLayout({
  brand,
  navLinks,
  footerExtras,
  beforeShell,
  afterShell,
  children,
}: SiteLayoutProps) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={jetbrainsMono.variable}
    >
      <body className="font-mono antialiased">
        {beforeShell}
        <PageShell
          brand={brand}
          navLinks={navLinks}
          footerExtras={footerExtras}
        >
          {children}
        </PageShell>
        <Analytics />
        {afterShell}
      </body>
    </html>
  )
}
