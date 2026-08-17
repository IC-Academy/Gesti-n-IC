// Sesión de demostración. En esta primera versión no hay un backend de
// autenticación real: se "inicia sesión" eligiendo una de las personas
// sembradas en demoStore. La versión productiva sustituirá esto por el
// proveedor de identidad corporativo (p. ej. Microsoft Entra ID) sin cambiar
// la forma en la que el resto de la app consume useSession().
//
// IMPORTANTE: el selector de rol/persona SOLO debe existir en modo demo. Está
// aislado aquí a propósito para que, al conectar autenticación real, baste con
// sustituir este archivo (y quitar la pantalla de selección de persona) sin
// tocar guards ni pantallas.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useDemoStore } from './demoStore'
import type { User } from './types'

const SESSION_KEY = 'gestion_ic_session_user_id'

interface SessionContextValue {
  user: User | null
  entrarComo: (userId: string) => void
  salir: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const state = useDemoStore()
  const [userId, setUserId] = useState<string | null>(() => {
    try {
      return window.sessionStorage.getItem(SESSION_KEY)
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (userId) window.sessionStorage.setItem(SESSION_KEY, userId)
      else window.sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* sessionStorage no disponible */
    }
  }, [userId])

  const user = userId ? (state.users.find((u) => u.id === userId && u.activo) ?? null) : null

  const value: SessionContextValue = {
    user,
    entrarComo: (id: string) => setUserId(id),
    salir: () => setUserId(null),
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>')
  return ctx
}
