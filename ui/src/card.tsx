import type { HTMLAttributes, ReactNode } from 'react'

// == Card ==

// An actionable card lifts a little under the cursor - that movement is the
// whole affordance. The source system also blooms a cursor-tracked gradient
// under it, which on a page of sixty cards reads as noise, so it stays out
const interactive =
  'hover:border-accent hover:-translate-y-0.5 hover:shadow-lifted motion-reduce:hover:translate-y-0'

// A slash-separated eyebrow reads as a path: the last segment is the subject
function splitEyebrow(eyebrow: ReactNode): ReactNode {
  if (typeof eyebrow !== 'string' || !eyebrow.includes('/')) return eyebrow
  const at = eyebrow.lastIndexOf('/')
  return (
    <>
      {eyebrow.slice(0, at + 1)}
      <span className="font-medium fg-primary">{eyebrow.slice(at + 1)}</span>
    </>
  )
}

type CardProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  children: ReactNode
  href?: string
  eyebrow?: ReactNode
  glyph?: ReactNode
  title?: ReactNode
  level?: 2 | 3 | 4 | 5 | 6
  badge?: ReactNode
  desc?: ReactNode
  clamp?: boolean
  foot?: ReactNode
  meta?: string[]
  static?: boolean
}

export function Card({
  children,
  href,
  eyebrow,
  glyph,
  title,
  level = 3,
  badge,
  desc,
  clamp = false,
  foot,
  meta,
  static: isStatic = false,
  className = '',
  ...rest
}: CardProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  const classes = `group relative flex flex-col gap-2 p-6 surface-card overflow-hidden no-underline transition-[color,border-color,transform,box-shadow] duration-base ease-out motion-reduce:transition-none focus-ring ${
    isStatic ? '' : interactive
  } ${className}`

  // the eyebrow is block rather than flex: text-overflow never applies to a
  // flex container's children, so an ellipsis there silently does nothing
  const body = (
    <>
      {eyebrow != null && (
        <div className="relative -mx-6 -mt-6 mb-2 block truncate border-b border-faint bg-bg-sunken px-6 py-2 fg-subtle text-[11px] leading-4">
          {splitEyebrow(eyebrow)}
        </div>
      )}
      {(glyph || title || badge) && (
        <div className="relative flex items-center gap-2">
          {glyph && (
            <span
              aria-hidden="true"
              className="inline-grid flex-none place-items-center w-7 h-7 rounded-sm bg-bg-raised text-accent"
            >
              {glyph}
            </span>
          )}
          {title && (
            <Heading className="m-0 min-w-0 flex-1 truncate type-heading fg-title">
              {title}
            </Heading>
          )}
          {badge != null && (
            <span className="ml-auto flex-none inline-flex items-center gap-1 text-accent-secondary text-xs leading-4 whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>
      )}
      {desc && (
        <p
          className={`relative m-0 fg-body type-body ${clamp ? 'line-clamp-3' : ''}`}
        >
          {desc}
        </p>
      )}
      {children && <div className="relative mt-2">{children}</div>}
      {(foot || meta) && (
        <div className="relative flex items-center justify-between gap-3 mt-auto pt-3">
          <div>{foot}</div>
          <div className="flex gap-3 whitespace-nowrap">
            {(meta ?? []).map((item) => (
              <span key={item} className="type-meta fg-subtle">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  )

  if (href) {
    return (
      <a {...rest} href={href} className={classes}>
        {body}
      </a>
    )
  }

  // A card that does something is a button, so it is reachable by keyboard and
  // announced as actionable. Anything interactive inside it would nest, so a
  // clickable card holds plain content only
  if (rest.onClick) {
    return (
      <button type="button" {...rest} className={`${classes} text-left`}>
        {body}
      </button>
    )
  }

  return (
    <div {...rest} className={classes}>
      {body}
    </div>
  )
}

// == Grid ==

type CardGridProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  min?: string
}

export function CardGrid({
  children,
  min,
  className = '',
  style,
  ...rest
}: CardGridProps) {
  return (
    <div
      {...rest}
      style={
        min
          ? {
              ...style,
              gridTemplateColumns: `repeat(auto-fill, minmax(${min}, 1fr))`,
            }
          : style
      }
      className={`grid gap-4 ${min ? '' : 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'} ${className}`}
    >
      {children}
    </div>
  )
}
