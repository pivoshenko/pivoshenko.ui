import type { HTMLAttributes } from 'react'

type AvatarSize = 16 | 24 | 32 | 48 | 64

const sizeClass: Record<AvatarSize, string> = {
  16: 'w-4 h-4 text-[8px]',
  24: 'w-6 h-6 text-[10px]',
  32: 'w-8 h-8 text-xs',
  48: 'w-12 h-12 text-sm',
  64: 'w-16 h-16 text-base',
}

type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  initials: string
  size?: AvatarSize
  className?: string
}

export function Avatar({
  initials,
  size = 32,
  className = '',
  ...rest
}: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={initials}
      {...rest}
      className={`inline-grid place-items-center rounded-sm bg-fg-default text-bg-canvas font-mono font-extrabold tracking-[-0.04em] leading-none ${sizeClass[size]} ${className}`}
    >
      {initials.toUpperCase()}
    </span>
  )
}
