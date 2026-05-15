type AvatarSize = 16 | 24 | 32 | 48 | 64

type AvatarProps = {
  initials: string
  size?: AvatarSize
  className?: string
}

const sizeClass: Record<AvatarSize, string> = {
  16: 'w-4 h-4 text-[8px]',
  24: 'w-6 h-6 text-[10px]',
  32: 'w-8 h-8 text-xs',
  48: 'w-12 h-12 text-sm',
  64: 'w-16 h-16 text-base',
}

export function Avatar({ initials, size = 32, className = '' }: AvatarProps) {
  return (
    <span
      aria-label={initials}
      className={`inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black font-mono font-semibold tracking-tight ${sizeClass[size]} ${className}`}
    >
      {initials.toUpperCase()}
    </span>
  )
}
