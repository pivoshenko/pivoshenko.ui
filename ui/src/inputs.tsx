import { Search, X } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'

type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export function TextInput({ className = '', ...rest }: TextInputProps) {
  return (
    <input
      type="text"
      {...rest}
      className={`font-mono text-sm bg-bg-surface text-fg-default border border-ui rounded px-2.5 py-1.5 outline-none focus:border-accent-primary placeholder:fg-muted disabled:opacity-50 transition-colors ${className}`}
    />
  )
}

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  leading?: ReactNode
  trailing?: ReactNode
  onClear?: () => void
}

export function SearchInput({
  leading = <Search size={14} strokeWidth={2} aria-hidden="true" />,
  trailing,
  onClear,
  value,
  className = '',
  ...rest
}: SearchInputProps) {
  const showClear = onClear && typeof value === 'string' && value.length > 0
  return (
    <div
      className={`inline-flex items-center gap-2 bg-bg-surface border border-ui rounded px-2.5 py-1.5 focus-within:border-accent-primary transition-colors ${className}`}
    >
      {leading ? <span className="fg-muted">{leading}</span> : null}
      <input
        type="search"
        value={value}
        {...rest}
        className="bg-transparent font-mono text-sm text-fg-default placeholder:fg-muted outline-none flex-1 min-w-0"
      />
      {showClear ? (
        <button
          type="button"
          aria-label="Clear"
          onClick={onClear}
          className="fg-muted hover-secondary"
        >
          <X size={12} strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
      {trailing ? <span className="fg-muted">{trailing}</span> : null}
    </div>
  )
}

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
}

export function Checkbox({
  label,
  className = '',
  id,
  ...rest
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2 font-mono text-sm fg-secondary cursor-pointer ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        {...rest}
        className="w-4 h-4 bg-bg-surface border border-ui rounded-sm accent-accent-primary"
      />
      {label}
    </label>
  )
}
