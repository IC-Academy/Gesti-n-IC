import type { HTMLAttributes, ReactNode } from 'react'
import { classNames } from '../../lib/format'

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames('rounded-2xl border border-ic-line bg-white shadow-ic-sm', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={classNames('flex items-start justify-between gap-4 border-b border-ic-line px-5 py-4 sm:px-6', className)}>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-ic-ink">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-ic-slate">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={classNames('px-5 py-4 sm:px-6', className)} {...rest}>
      {children}
    </div>
  )
}
