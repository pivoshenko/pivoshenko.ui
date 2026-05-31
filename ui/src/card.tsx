import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={`bg-bg-surface border border-ui rounded ${className}`}
    >
      {children}
    </div>
  )
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export function CardHeader({
  className = '',
  children,
  ...rest
}: CardHeaderProps) {
  return (
    <div {...rest} className={`px-4 py-3 border-b border-faint ${className}`}>
      {children}
    </div>
  )
}

type CardBodyProps = HTMLAttributes<HTMLDivElement>

export function CardBody({ className = '', children, ...rest }: CardBodyProps) {
  return (
    <div {...rest} className={`px-4 py-3 ${className}`}>
      {children}
    </div>
  )
}
