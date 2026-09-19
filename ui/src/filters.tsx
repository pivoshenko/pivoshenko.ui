'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { SearchField } from './inputs'
import { Menu, MenuItem } from './menu'
import { TagButton, Tags } from './tag'

// == Search ==

type SearchBarProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
  /** keyboard shortcut that focuses the field; pass false to disable */
  shortcut?: string | false
  className?: string
}

export function SearchBar({
  value,
  onValueChange,
  placeholder = 'Search',
  label = 'Search',
  shortcut = '/',
  className = '',
}: SearchBarProps) {
  const field = useRef<HTMLInputElement>(null)

  // the shortcut jumps to the field, the way every search-first page on the web
  // does, but not while the caret is already in something typable
  useEffect(() => {
    if (shortcut === false) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== shortcut || event.metaKey || event.ctrlKey) return
      const el = document.activeElement
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return
      }
      // without this the key that focused the field also lands inside it
      event.preventDefault()
      field.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcut])

  return (
    <SearchField
      ref={field}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder={placeholder}
      aria-label={label}
      hint={shortcut === false ? undefined : shortcut}
      className={`w-full ${className}`}
    />
  )
}

// == Filtering ==

type TagFilterProps = {
  tags: Array<{ tag: string; count?: number }>
  active: Set<string>
  onToggle: (tag: string) => void
  label?: string
  className?: string
}

export function TagFilter({
  tags,
  active,
  onToggle,
  label = 'Filter by tag',
  className = '',
}: TagFilterProps) {
  return (
    <Tags aria-label={label} className={className}>
      {tags.map(({ tag, count }) => (
        <TagButton
          key={tag}
          count={count}
          active={active.has(tag)}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </TagButton>
      ))}
    </Tags>
  )
}

export type SelectOption<T extends string> = { value: T; label: string }

type SelectMenuProps<T extends string> = {
  value: T
  options: Array<SelectOption<T>>
  onSelect: (value: T) => void
  icon?: ReactNode
  align?: 'start' | 'end'
  className?: string
}

export function SelectMenu<T extends string>({
  value,
  options,
  onSelect,
  icon,
  align = 'end',
  className = '',
}: SelectMenuProps<T>) {
  const current = options.find((option) => option.value === value)

  return (
    <Menu
      align={align}
      label={current?.label ?? value}
      icon={icon}
      className={className}
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          selected={option.value === value}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </MenuItem>
      ))}
    </Menu>
  )
}

// == Chrome ==

const barButton =
  'type-meta fg-subtle hover-primary focus-ring border-card bg-bg-sunken inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors duration-fast hover:border-accent'

type BarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  children: ReactNode
}

export function BarButton({
  icon,
  children,
  className = '',
  ...rest
}: BarButtonProps) {
  return (
    <button type="button" {...rest} className={`${barButton} ${className}`}>
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 text-accent">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  )
}
