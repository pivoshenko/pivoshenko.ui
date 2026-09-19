import { ChevronRight } from 'lucide-react'
import type { HTMLAttributes } from 'react'

export type Crumb = { label: string; href?: string }

type BreadcrumbProps = HTMLAttributes<HTMLElement> & {
  items: Crumb[]
}

export function Breadcrumb({
  items,
  className = '',
  ...rest
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" {...rest} className={`type-meta ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 list-none m-0 p-0">
        {items.map((crumb, i) => {
          const last = i === items.length - 1
          return (
            <li
              key={crumb.href ?? crumb.label}
              className="flex items-center gap-1.5"
            >
              {i ? (
                <ChevronRight
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 fg-muted"
                />
              ) : null}
              {crumb.href && !last ? (
                <a
                  href={crumb.href}
                  className="no-underline fg-subtle hover-primary transition-colors duration-fast rounded-sm focus-ring"
                >
                  {crumb.label}
                </a>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  className="fg-primary"
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
