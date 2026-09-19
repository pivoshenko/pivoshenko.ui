import { ChevronRight } from 'lucide-react'
import type {
  ComponentPropsWithRef,
  InputHTMLAttributes,
  ReactNode,
} from 'react'

const fieldInput =
  'flex-1 min-w-0 p-0 border-0 bg-transparent text-fg-default font-mono text-sm leading-5 placeholder:text-fg-faint outline-none focus:outline-none focus-visible:outline-none focus:shadow-none'

// the native cancel affordance is a white glyph in the dark chrome, so it is
// desaturated down to the field's own foreground weight
const cancelButton =
  '[&::-webkit-search-cancel-button]:[filter:grayscale(1)_opacity(0.6)]'

// ComponentPropsWithRef rather than InputHTMLAttributes: a caller needs the ref
// to focus the field from a keyboard shortcut, and in React 19 a ref is an
// ordinary prop, so it rides along in ...rest without forwardRef
type SearchFieldProps = ComponentPropsWithRef<'input'> & {
  hint?: ReactNode
}

export function SearchField({
  hint,
  className = '',
  ...rest
}: SearchFieldProps) {
  return (
    <div
      className={`flex items-center gap-2 h-9 px-3 border border-card rounded-md bg-bg-sunken transition-colors duration-fast focus-within:border-accent ${className}`}
    >
      <ChevronRight
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="text-accent shrink-0"
      />
      <input
        type="search"
        {...rest}
        className={`${fieldInput} ${cancelButton}`}
      />
      {hint ? (
        <kbd className="shrink-0 px-1.5 py-px border border-ui rounded-sm fg-subtle font-mono text-[11px] leading-4">
          {hint}
        </kbd>
      ) : null}
    </div>
  )
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export function TextInput({ className = '', ...rest }: TextInputProps) {
  return (
    <input
      type="text"
      {...rest}
      className={`h-9 px-3 border border-card rounded-md bg-bg-sunken text-fg-default font-mono text-sm leading-5 placeholder:text-fg-faint outline-none focus:border-accent disabled:opacity-50 transition-colors duration-fast focus-ring ${className}`}
    />
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
      className={`inline-flex items-center gap-2 font-mono text-[13px] leading-5 fg-body cursor-pointer ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        {...rest}
        className="w-4 h-4 shrink-0 border border-card rounded-sm bg-bg-sunken accent-accent focus-ring"
      />
      {label}
    </label>
  )
}
