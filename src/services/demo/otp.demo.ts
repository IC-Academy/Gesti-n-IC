import type { OtpProposito, ServiceResult } from '../../types'
import { delay, getDb, mutateDb, newId, nowIso } from './db'
import { maskEmail, maskPhone } from '../../lib/format'

const CODIGO_DEMO = '123456'
const VIGENCIA_MINUTOS = 10

function maskDestino(destino: string): string {
  return destino.includes('@') ? maskEmail(destino) : maskPhone(destino)
}

export interface SolicitarOtpResult {
  destinoEnmascarado: string
  expiraEn: string
}

async function solicitar(
  destino: string,
  proposito: OtpProposito,
  referenciaId?: string,
): Promise<ServiceResult<SolicitarOtpResult>> {
  const expiraEn = new Date(Date.now() + VIGENCIA_MINUTOS * 60_000).toISOString()
  mutateDb((db) => {
    db.otp.unshift({
      id: newId('otp'),
      destino,
      proposito,
      codigo: CODIGO_DEMO,
      referenciaId,
      usado: false,
      expiraEn,
      creadoEn: nowIso(),
    })
  })
  return delay({ ok: true, data: { destinoEnmascarado: maskDestino(destino), expiraEn } })
}

async function verificar(
  destino: string,
  proposito: OtpProposito,
  codigo: string,
  referenciaId?: string,
): Promise<ServiceResult<{ verificado: true }>> {
  const db = getDb()
  const registro = db.otp.find(
    (o) => o.destino === destino && o.proposito === proposito && o.referenciaId === referenciaId && !o.usado,
  )

  if (!registro) {
    return delay({
      ok: false,
      error: { code: 'OTP_NO_ENCONTRADO', message: 'Solicita un nuevo código antes de continuar.' },
    })
  }

  if (new Date(registro.expiraEn).getTime() < Date.now()) {
    return delay({
      ok: false,
      error: { code: 'OTP_EXPIRADO', message: 'El código ha expirado. Solicita uno nuevo.' },
    })
  }

  if (codigo.trim() !== registro.codigo) {
    return delay({
      ok: false,
      error: { code: 'OTP_INVALIDO', message: 'El código ingresado no es correcto.' },
    })
  }

  mutateDb((d) => {
    const r = d.otp.find((o) => o.id === registro.id)
    if (r) r.usado = true
  })

  return delay({ ok: true, data: { verificado: true } })
}

export const otpDemo = { solicitar, verificar }
