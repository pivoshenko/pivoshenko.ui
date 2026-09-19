import Link from 'next/link'

type LogoProps = {
  monogram?: string
  className?: string
}

export function Logo({ monogram = 'VP', className = '' }: LogoProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-grid place-items-center w-6 h-6 rounded-sm bg-fg-default text-bg-canvas font-mono text-[10px] font-extrabold tracking-[-0.04em] leading-none transition-transform duration-base ease-out motion-reduce:transition-none ${className}`}
    >
      {monogram}
      <span className="absolute -right-[3px] -bottom-[3px] w-[7px] h-[7px] rounded-[2px] bg-accent ring-2 ring-bg-canvas" />
    </span>
  )
}

type BrandProps = {
  name: string
  suffix?: string
  separator?: string
  href?: string
  monogram?: string
  mark?: boolean
  className?: string
}

export function Brand({
  name,
  suffix,
  separator = '.',
  href = '/',
  monogram,
  mark = true,
  className = '',
}: BrandProps) {
  // a single dotted name carries its own suffix, so `pivoshenko.ai` splits
  // into root + separator + accent suffix without the caller restating it
  const dot = suffix === undefined ? name.indexOf('.') : -1
  const root = dot === -1 ? name : name.slice(0, dot)
  const tail = dot === -1 ? suffix : name.slice(dot + 1)

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 type-logo fg-primary no-underline ${className}`}
    >
      {mark ? (
        <Logo
          monogram={monogram}
          className="group-hover:-rotate-6 motion-reduce:group-hover:rotate-0"
        />
      ) : null}
      <span>
        <span className="fg-primary">{root}</span>
        {tail ? <span className="fg-muted">{separator}</span> : null}
        {tail ? <span className="text-accent">{tail}</span> : null}
      </span>
    </Link>
  )
}
