import { ArrowRight } from 'lucide-react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

// == List ==

type ListProps = HTMLAttributes<HTMLUListElement> & {
  children: ReactNode
  lead?: string
}

export function List({
  children,
  lead = '88px',
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
      {children}
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
}

export function Row({
  title,
  href,
  lead,
  desc,
  trail,
  static: isStatic = false,
  className = '',
  ...rest
}: RowProps) {
  const actionable = !isStatic && (href != null || rest.onClick != null)

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
          <ArrowRight
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className="hidden sm:block text-accent opacity-0 -translate-x-1.5 transition-[opacity,transform] duration-base ease-out group-hover:opacity-100 group-hover:translate-x-0 motion-reduce:transition-none motion-reduce:translate-x-0"
          />
        )}
      </span>
    </>
  )

  if (href) {
    return (
      <li>
        <a {...rest} href={href} className={classes}>
          {body}
        </a>
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
