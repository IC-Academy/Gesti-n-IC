export function formatFecha(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatFechaCorta(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatFechaHora(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatMoneda(valor?: number): string {
  if (valor === undefined || valor === null) return '—'
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
}

/** Enmascara un correo: jo****@intercon.com.mx */
export function maskEmail(correo: string): string {
  const [user, domain] = correo.split('@')
  if (!domain) return correo
  const visible = user.slice(0, Math.min(2, user.length))
  return `${visible}${'*'.repeat(Math.max(user.length - visible.length, 3))}@${domain}`
}

/** Enmascara un teléfono: dejando visibles solo los últimos 2 dígitos. */
export function maskPhone(telefono: string): string {
  const digits = telefono.replace(/\D/g, '')
  if (digits.length < 4) return '**'
  return `${'*'.repeat(digits.length - 2)}${digits.slice(-2)}`
}

export function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
