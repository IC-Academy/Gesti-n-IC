import { useEffect, useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { OtpProposito } from '../../types'
import { otpService } from '../../services/otpService'
import { useToast } from '../../context/ToastContext'

export function OtpModal({
  open,
  destino,
  destinoEnmascarado,
  proposito,
  referenciaId,
  onClose,
  onVerified,
}: {
  open: boolean
  destino: string
  destinoEnmascarado: string
  proposito: OtpProposito
  referenciaId?: string
  onClose: () => void
  onVerified: () => void
}) {
  const [digitos, setDigitos] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [verificando, setVerificando] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const { notificar } = useToast()

  useEffect(() => {
    if (open) {
      setDigitos(Array(6).fill(''))
      setError(null)
      window.setTimeout(() => refs.current[0]?.focus(), 50)
    }
  }, [open])

  const actualizarDigito = (idx: number, valor: string) => {
    const limpio = valor.replace(/\D/g, '').slice(-1)
    const copia = [...digitos]
    copia[idx] = limpio
    setDigitos(copia)
    if (limpio && idx < 5) refs.current[idx + 1]?.focus()
  }

  const onPaste = (e: React.ClipboardEvent) => {
    const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!texto) return
    e.preventDefault()
    setDigitos((prev) => {
      const copia = [...prev]
      texto.split('').forEach((c, i) => (copia[i] = c))
      return copia
    })
    refs.current[Math.min(texto.length, 5)]?.focus()
  }

  const codigo = digitos.join('')

  const verificar = async () => {
    if (codigo.length !== 6) {
      setError('Ingresa los 6 dígitos del código.')
      return
    }
    setVerificando(true)
    setError(null)
    const res = await otpService.verificar(destino, proposito, codigo, referenciaId)
    setVerificando(false)
    if (!res.ok) {
      setError(res.error.message)
      return
    }
    onVerified()
  }

  const reenviar = async () => {
    setReenviando(true)
    await otpService.solicitar(destino, proposito, referenciaId)
    setReenviando(false)
    setDigitos(Array(6).fill(''))
    notificar({ tipo: 'info', titulo: 'Código reenviado', descripcion: `Enviamos un nuevo código a ${destinoEnmascarado}.` })
    refs.current[0]?.focus()
  }

  return (
    <Modal open={open} onClose={onClose} title="Verifica tu identidad" size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ic-blue-50 text-ic-blue-700">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-sm text-ic-slate">
          Enviamos un código de verificación a <span className="font-semibold text-ic-ink">{destinoEnmascarado}</span>.
          Ingrésalo para continuar.
        </p>

        <div className="flex gap-2" onPaste={onPaste}>
          {digitos.map((d, idx) => (
            <input
              key={idx}
              ref={(el) => {
                refs.current[idx] = el
              }}
              value={d}
              onChange={(e) => actualizarDigito(idx, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digitos[idx] && idx > 0) refs.current[idx - 1]?.focus()
              }}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Dígito ${idx + 1} del código`}
              className="h-12 w-10 rounded-lg border border-ic-line text-center text-lg font-semibold text-ic-ink focus-ring"
            />
          ))}
        </div>

        {error && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <p className="text-xs text-ic-slate">
          Modo demo: utiliza el código <span className="font-semibold text-ic-ink">123456</span>.
        </p>

        <div className="flex w-full flex-col gap-2 pt-2">
          <Button onClick={verificar} loading={verificando} fullWidth>
            Verificar código
          </Button>
          <Button variant="ghost" onClick={reenviar} loading={reenviando} fullWidth size="sm">
            Reenviar código
          </Button>
        </div>
      </div>
    </Modal>
  )
}
