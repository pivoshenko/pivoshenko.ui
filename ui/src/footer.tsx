import { Globe } from 'lucide-react'
import type { ReactNode } from 'react'
import type { AccentName } from '../palette'
import { Field, type FieldKind } from './field'
import { GitHubMark, LinkedInMark } from './marks'

export type FooterLink = {
  label: string
  href: string
  external?: boolean
  icon: ReactNode
}

const WebsiteIcon = () => (
  <Globe className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
)

export const rssLink: FooterLink = {
  label: 'RSS',
  href: '/rss.xml',
  icon: (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <g transform="translate(2 2) scale(0.8333)">
        <path d="M19.199 24C19.199 13.467 10.533 4.8 0 4.8V0c13.165 0 24 10.835 24 24h-4.801zM3.291 17.415a3.3 3.3 0 0 1 3.293 3.295A3.303 3.303 0 0 1 3.283 24C1.47 24 0 22.526 0 20.71s1.475-3.294 3.291-3.295zM15.909 24h-4.665c0-6.169-5.075-11.245-11.244-11.245V8.09c8.727 0 15.909 7.184 15.909 15.91z" />
      </g>
    </svg>
  ),
}

const baselineLinks: FooterLink[] = [
  {
    label: 'Website',
    href: 'https://pivoshenko.dev',
    external: true,
    icon: <WebsiteIcon />,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/pivoshenko',
    external: true,
    icon: <GitHubMark />,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/pivoshenko',
    external: true,
    icon: <LinkedInMark />,
  },
]

type FooterProps = {
  extras?: FooterLink[]
  /** Drop the website link on pivoshenko.dev itself, where it is a self-link */
  website?: boolean
  pattern?: boolean
  field?: FieldKind
  tint?: AccentName
  tintAlt?: AccentName
  year?: number
  contact?: string
  className?: string
}

export function Footer({
  extras = [],
  website = true,
  pattern = true,
  field = 'contours',
  tint,
  tintAlt,
  year = new Date().getFullYear(),
  contact = 'contact@pivoshenko.dev',
  className = '',
}: FooterProps = {}) {
  const links = [
    ...(website
      ? baselineLinks
      : baselineLinks.filter((l) => l.label !== 'Website')),
    ...extras,
  ]

  return (
    <footer
      className={`relative mt-16 w-full border-t border-border-strong bg-crust overflow-hidden isolate ${className}`}
    >
      {pattern ? (
        <Field kind={field} mask="radial" tint={tint} tintAlt={tintAlt} />
      ) : null}
      {/* the band only holds its 56px row once the two halves fit side by side.
          Below that it stacks and grows, because a fixed height here meets the
          footer's own `overflow-hidden` and clips the links away entirely */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-4 type-meta fg-subtle sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-0">
        {/* the accent stub starts at the content edge rather than the viewport
            edge, matching the nav's, and keeps its fixed 96px run. It hangs off
            the band rather than the line of text, so a wrapped credit cannot
            drag it down the band */}
        <span
          aria-hidden="true"
          className="absolute -top-px left-4 h-[2px] w-24 bg-accent sm:left-6"
        />
        <span>
          {year} Volodymyr Pivoshenko &lt;
          <a
            href={`mailto:${contact}`}
            className="fg-subtle hover-primary no-underline transition-colors duration-fast"
          >
            {contact}
          </a>
          &gt;
        </span>

        <nav aria-label="Elsewhere" className="flex items-center gap-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-label={link.label}
              {...(link.external && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
              className="fg-subtle hover-primary transition-colors duration-fast focus-ring"
            >
              {link.icon}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
