import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { classNames } from '../../lib/format'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const anchoMax = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-ic-blue-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={classNames('relative w-full rounded-2xl bg-white shadow-ic-lg', anchoMax)}>
        <div className="flex items-start justify-between gap-4 border-b border-ic-line px-6 py-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-ic-ink">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-ic-slate">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ic-slate transition hover:bg-ic-blue-50 hover:text-ic-ink focus-ring"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
