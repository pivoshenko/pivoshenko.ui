'use client'

import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from 'react'
import { createContext, useContext } from 'react'

// a linked row is an <a> unless the site hands us its router's link, and a
// site sets that once on the list rather than on every row
const RowAs = createContext<ElementType>('a')

// == List ==

type ListProps = HTMLAttributes<HTMLUListElement> & {
  children: ReactNode
  lead?: string
  /** Element or component used for a linked row, e.g. next/link */
  as?: ElementType
}

export function List({
  children,
  lead = '88px',
  as = 'a',
  className = '',
  style,
  ...rest
}: ListProps) {
  return (
    <ul
      {...rest}
      // the lead column is shared by every row, so it rides on the list
      style={{ ...style, '--lead': lead } as CSSProperties}
      className={`list-none m-0 p-0 border-t border-faint ${className}`}
    >
      <RowAs.Provider value={as}>{children}</RowAs.Provider>
    </ul>
  )
}

// == Row ==

type RowProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title: ReactNode
  href?: string
  lead?: ReactNode
  desc?: ReactNode
  trail?: ReactNode
  static?: boolean
  /** A link that leaves the site: opens in a new tab and takes the diagonal arrow */
  external?: boolean
  /** Element or component used for a linked row, overriding the list's */
  as?: ElementType
}

export function Row({
  title,
  href,
  lead,
  desc,
  trail,
  static: isStatic = false,
  external = false,
  as,
  className = '',
  ...rest
}: RowProps) {
  const inherited = useContext(RowAs)
  const Link = as ?? inherited
  const actionable = !isStatic && (href != null || rest.onClick != null)
  // the nudge follows the arrow, the same rule ArrowLink follows: a diagonal
  // arrow that only slid sideways would point one way and move another
  const Arrow = external ? ArrowUpRight : ArrowRight

  const classes = `group relative grid w-full grid-cols-[1fr] sm:grid-cols-[var(--lead,88px)_1fr_auto] items-baseline gap-0.5 sm:gap-4 p-3 border-b border-faint fg-primary text-left no-underline transition-colors duration-fast focus-ring ${
    isStatic ? '' : 'hover:bg-bg-surface'
  } ${className}`

  const body = (
    <>
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 w-0.5 h-0 bg-accent transition-[height,top] duration-base ease-out motion-reduce:transition-none ${
          isStatic ? '' : 'group-hover:top-[20%] group-hover:h-[60%]'
        }`}
      />
      {/* self-center rather than the row's baseline: a lead is as often a
          glyph as it is text, and a glyph on a text baseline rides high */}
      {lead != null && (
        <span className="type-meta fg-subtle self-center">{lead}</span>
      )}
      <span className="grid gap-0.5 min-w-0">
        <span className="type-ui font-semibold">{title}</span>
        {desc && <span className="fg-body text-[13px] leading-5">{desc}</span>}
      </span>
      <span className="inline-flex items-center gap-2 whitespace-nowrap type-meta fg-subtle">
        {trail}
        {actionable && (
          <Arrow
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className={`hidden sm:block text-accent opacity-0 transition-[opacity,transform] duration-base ease-out group-hover:opacity-100 group-hover:translate-x-0 motion-reduce:transition-none motion-reduce:translate-x-0 ${
              external ? 'translate-x-0 translate-y-1' : '-translate-x-1.5'
            }`}
          />
        )}
      </span>
    </>
  )

  if (href) {
    return (
      <li>
        <Link
          {...rest}
          {...(external
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : null)}
          href={href}
          className={classes}
        >
          {body}
        </Link>
      </li>
    )
  }

  // a row that does something is a button, so it is keyboard reachable and
  // announced as actionable - the same rule Card follows
  if (rest.onClick) {
    return (
      <li>
        <button type="button" {...rest} className={classes}>
          {body}
        </button>
      </li>
    )
  }

  return (
    <li>
      <div {...rest} className={classes}>
        {body}
      </div>
    </li>
  )
}
