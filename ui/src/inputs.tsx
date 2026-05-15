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

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  leading?: ReactNode
  trailing?: ReactNode
  onClear?: () => void
}

export function SearchInput({
  leading,
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
          ×
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
