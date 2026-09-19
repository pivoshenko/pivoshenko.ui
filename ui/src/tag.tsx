import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react'

export type TagTone = 'success' | 'warning' | 'danger' | 'info'

const chip =
  'inline-flex items-center gap-1.5 px-2 py-0.5 border border-card rounded-sm bg-bg-raised shadow-chip font-mono font-medium text-xs leading-[18px] no-underline transition-colors duration-fast focus-ring'

const toneText: Record<TagTone, string> = {
  success: 'text-accent-success',
  warning: 'text-accent-warning',
  danger: 'text-accent-danger',
  info: 'text-accent-info',
}

// the tone rule outranks the hover rule in the source system, so a toned chip
// keeps its colour on hover and only its border moves
// fg-subtle is what the source system asks for, but on the raised fill it drops
// under 4.5:1 at 12px, so a resting chip sits one step brighter
const resting = (tone?: TagTone) =>
  tone ? toneText[tone] : 'fg-body hover-primary'

type TagDotProps = { tone?: TagTone }

function TagDot({ tone }: TagDotProps) {
  if (!tone) return null
  return (
    <span
      aria-hidden="true"
      className="w-1.5 h-1.5 shrink-0 rounded-full bg-current"
    />
  )
}

type TagProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement> & HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  children: ReactNode
  tone?: TagTone
  count?: number
  active?: boolean
  href?: string
}

export function Tag({
  children,
  tone,
  count,
  active,
  href,
  className = '',
  ...rest
}: TagProps) {
  const state = active
    ? 'bg-fg-default text-bg-canvas border-fg-default'
    : `${resting(tone)} hover:border-overlay1`
  const body = (
    <>
      <TagDot tone={tone} />
      <span>{children}</span>
      {count != null ? (
        <span
          className={`tabular-nums ${active ? 'text-bg-raised' : 'text-overlay2'}`}
        >
          {count}
        </span>
      ) : null}
    </>
  )

  if (href) {
    return (
      <a href={href} {...rest} className={`${chip} ${state} ${className}`}>
        {body}
      </a>
    )
  }

  return (
    <span {...rest} className={`${chip} ${state} cursor-default ${className}`}>
      {body}
    </span>
  )
}

type TagButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  children: ReactNode
  tone?: TagTone
  count?: number
  active?: boolean
}

export function TagButton({
  children,
  tone,
  count,
  active = false,
  className = '',
  ...rest
}: TagButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      {...rest}
      className={`group ${chip} ${resting(tone)} cursor-pointer hover:border-overlay1 aria-pressed:bg-fg-default aria-pressed:text-bg-canvas aria-pressed:border-fg-default ${className}`}
    >
      <TagDot tone={tone} />
      <span>{children}</span>
      {count != null ? (
        <span className="tabular-nums text-overlay2 group-aria-pressed:text-bg-raised">
          {count}
        </span>
      ) : null}
    </button>
  )
}

type TagsProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode }

export function Tags({ className = '', children, ...rest }: TagsProps) {
  return (
    <div {...rest} className={`flex flex-wrap gap-1.5 ${className}`}>
      {children}
    </div>
  )
}
