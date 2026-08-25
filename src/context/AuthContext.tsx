import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Rol, SesionUsuario, Usuario } from '../types'
import { authService } from '../services/authService'

const STORAGE_KEY = 'gestion-ic:sesion:v1'

interface AuthContextValue {
  usuario: Usuario | null
  cargando: boolean
  /** Rol simulado por un ADMIN para previsualizar la experiencia de otro perfil. */
  rolSimulado: Rol | null
  rolEfectivo: Rol | null
  iniciarSesion: (
    usuario: string,
    password: string,
  ) => Promise<{ ok: true; usuario: Usuario } | { ok: false; mensaje: string }>
  cerrarSesion: () => void
  simularRol: (rol: Rol | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function leerSesionGuardada(): SesionUsuario | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SesionUsuario) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionUsuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [rolSimulado, setRolSimulado] = useState<Rol | null>(null)

  useEffect(() => {
    setSesion(leerSesionGuardada())
    setCargando(false)
  }, [])

  const iniciarSesion: AuthContextValue['iniciarSesion'] = async (usuario, password) => {
    const resultado = await authService.login(usuario, password)
    if (!resultado.ok) return { ok: false, mensaje: resultado.error.message }
    setSesion(resultado.data)
    setRolSimulado(null)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resultado.data))
    } catch {
      /* almacenamiento no disponible: la sesión continúa solo en memoria */
    }
    return { ok: true, usuario: resultado.data.usuario }
  }

  const cerrarSesion = () => {
    setSesion(null)
    setRolSimulado(null)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* noop */
    }
  }

  const simularRol = (rol: Rol | null) => setRolSimulado(rol)

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario: sesion?.usuario ?? null,
      cargando,
      rolSimulado,
      rolEfectivo: rolSimulado ?? sesion?.usuario.rol ?? null,
      iniciarSesion,
      cerrarSesion,
      simularRol,
    }),
    [sesion, cargando, rolSimulado],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
