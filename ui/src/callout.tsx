import {
  CircleAlert,
  CircleCheck,
  Info,
  type LucideIcon,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'

export type CalloutTone = 'note' | 'info' | 'success' | 'warning' | 'danger'

const tones: Record<CalloutTone, { tint: string; icon: LucideIcon }> = {
  note: { tint: 'text-accent', icon: Sparkles },
  info: { tint: 'text-accent-info', icon: Info },
  success: { tint: 'text-accent-success', icon: CircleCheck },
  warning: { tint: 'text-accent-warning', icon: TriangleAlert },
  danger: { tint: 'text-accent-danger', icon: CircleAlert },
}

type CalloutProps = HTMLAttributes<HTMLDivElement> & {
  tone?: CalloutTone
  label?: string
  icon?: ReactNode
  children: ReactNode
}

export function Callout({
  tone = 'note',
  label,
  icon,
  className = '',
  children,
  ...rest
}: CalloutProps) {
  const { tint, icon: Icon } = tones[tone]
  return (
    <div
      {...rest}
      role={tone === 'danger' ? 'alert' : undefined}
      className={`surface-card rounded-md p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex ${tint}`} aria-hidden="true">
          {icon ?? <Icon size={14} strokeWidth={2} aria-hidden="true" />}
        </span>
        <span className={`type-label ${tint}`}>{label ?? tone}</span>
      </div>
      <div className="type-body fg-body [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </div>
  )
}
