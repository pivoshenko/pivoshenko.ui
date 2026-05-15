type LogoProps = {
  monogram?: string
  className?: string
}

export function Logo({ monogram = 'VP', className = '' }: LogoProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center h-6 w-6 bg-tag-active font-mono text-[11px] font-bold tracking-tight leading-none ${className}`}
    >
      {monogram}
    </span>
  )
}
