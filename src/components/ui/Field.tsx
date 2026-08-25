import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { classNames } from '../../lib/format'

function FieldShell({
  label,
  hint,
  error,
  required,
  children,
  id,
}: {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
  id?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ic-ink">
          {label}
          {required && <span className="ml-0.5 text-ic-blue-700">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ic-slate">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const baseInput =
  'h-10 w-full rounded-lg border bg-white px-3 text-sm text-ic-ink placeholder:text-slate-400 transition focus-ring disabled:bg-slate-50 disabled:text-slate-400'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, id, className, ...rest },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} id={inputId}>
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={!!error}
        className={classNames(baseInput, error ? 'border-red-300 focus-visible:ring-red-400' : 'border-ic-line', className)}
        {...rest}
      />
    </FieldShell>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, id, className, rows = 4, ...rest },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} id={inputId}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        className={classNames(
          'w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-ic-ink placeholder:text-slate-400 transition focus-ring disabled:bg-slate-50',
          error ? 'border-red-300 focus-visible:ring-red-400' : 'border-ic-line',
          className,
        )}
        {...rest}
      />
    </FieldShell>
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, id, className, children, ...rest },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} id={inputId}>
      <select
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={!!error}
        className={classNames(baseInput, 'pr-8', error ? 'border-red-300 focus-visible:ring-red-400' : 'border-ic-line', className)}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  )
})
