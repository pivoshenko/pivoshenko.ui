import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

type MenuProps = HTMLAttributes<HTMLDivElement>

export function Menu({ className = '', children, ...rest }: MenuProps) {
  return (
    <div
      role="menu"
      {...rest}
      className={`bg-white dark:bg-black border border-ui rounded shadow-none min-w-[12rem] py-1 ${className}`}
    >
      {children}
    </div>
  )
}

type MenuHeaderProps = HTMLAttributes<HTMLDivElement>

export function MenuHeader({
  className = '',
  children,
  ...rest
}: MenuHeaderProps) {
  return (
    <div
      {...rest}
      className={`font-mono text-xs uppercase tracking-widest fg-muted px-3 py-1.5 border-b border-faint ${className}`}
    >
      {children}
    </div>
  )
}

type MenuItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean
  indent?: boolean
  children: ReactNode
}

export function MenuItem({
  active,
  indent,
  className = '',
  children,
  ...rest
}: MenuItemProps) {
  const tone = active ? 'fg-primary' : 'fg-subtle hover-secondary'
  return (
    <a
      role="menuitem"
      {...rest}
      className={`block font-mono text-sm px-3 py-1.5 ${indent ? 'pl-6' : ''} ${tone} transition-colors ${className}`}
    >
      {children}
    </a>
  )
}
