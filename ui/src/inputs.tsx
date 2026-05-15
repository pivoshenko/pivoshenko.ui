import type { InputHTMLAttributes, ReactNode } from 'react'

type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export function TextInput({ className = '', ...rest }: TextInputProps) {
  return (
    <input
      type="text"
      {...rest}
      className={`font-mono text-sm bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 border border-ui rounded px-2.5 py-1.5 outline-none focus:border-stone-300 dark:focus:border-stone-700 placeholder:fg-muted disabled:opacity-50 transition-colors ${className}`}
    />
  )
}

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const ClearIcon = () => (
  <svg
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  leading?: ReactNode
  trailing?: ReactNode
  onClear?: () => void
}

export function SearchInput({
  leading = <SearchIcon />,
  trailing,
  onClear,
  value,
  className = '',
  ...rest
}: SearchInputProps) {
  const showClear = onClear && typeof value === 'string' && value.length > 0
  return (
    <div
      className={`inline-flex items-center gap-2 bg-white dark:bg-stone-950 border border-ui rounded px-2.5 py-1.5 ${className}`}
    >
      {leading ? <span className="fg-muted">{leading}</span> : null}
      <input
        type="search"
        value={value}
        {...rest}
        className="bg-transparent font-mono text-sm text-stone-900 dark:text-stone-100 placeholder:fg-muted outline-none flex-1 min-w-0"
      />
      {showClear ? (
        <button
          type="button"
          aria-label="Clear"
          onClick={onClear}
          className="fg-muted hover-secondary"
        >
          <ClearIcon />
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
        className="w-4 h-4 bg-white dark:bg-stone-950 border border-ui rounded-sm accent-morok-blue"
      />
      {label}
    </label>
  )
}
