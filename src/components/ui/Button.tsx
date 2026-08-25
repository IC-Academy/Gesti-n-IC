import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { classNames } from '../../lib/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const VARIANTES: Record<Variant, string> = {
  primary: 'bg-ic-blue-900 text-white hover:bg-ic-blue-800 shadow-ic-sm',
  secondary: 'bg-ic-yellow-500 text-ic-blue-900 hover:bg-ic-yellow-400 shadow-ic-sm',
  ghost: 'bg-transparent text-ic-blue-900 hover:bg-ic-blue-50',
  outline: 'bg-white text-ic-blue-900 border border-ic-line hover:border-ic-blue-300 hover:bg-ic-blue-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-ic-sm',
}

const TAMANOS: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading, fullWidth, className, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classNames(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-ring',
        VARIANTES[variant],
        TAMANOS[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
})
