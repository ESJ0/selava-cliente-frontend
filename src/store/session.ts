import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ClientSession } from '../types/session'

interface SessionState {
  session: ClientSession | null
  setSession: (session: ClientSession) => void
  clearSession: () => void
}

let expirationTimer: number | undefined

function expirationTime(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number }
    return payload.exp ? payload.exp * 1000 : null
  } catch { return null }
}

function scheduleExpiration(token: string, clear: () => void) {
  if (expirationTimer) window.clearTimeout(expirationTimer)
  const expiresAt = expirationTime(token)
  if (!expiresAt) return
  const delay = expiresAt - Date.now()
  if (delay <= 0) { clear(); return }
  expirationTimer = window.setTimeout(clear, Math.min(delay, 2_147_483_647))
}

// sessionStorage mantiene la sesión únicamente durante la pestaña actual. La
// contraseña nunca forma parte del estado ni del almacenamiento del navegador.
export const useClientSession = create<SessionState>()(persist(
  (set) => ({
    session: null,
    setSession: (session) => {
      scheduleExpiration(session.token, () => set({ session: null }))
      set({ session })
    },
    clearSession: () => {
      if (expirationTimer) window.clearTimeout(expirationTimer)
      set({ session: null })
    },
  }),
  {
    name: 'selava-client-session',
    storage: createJSONStorage(() => sessionStorage),
    merge: (persisted, current) => {
      const saved = (persisted as Partial<SessionState>).session
      const expiresAt = saved ? expirationTime(saved.token) : null
      return { ...current, session: expiresAt && expiresAt <= Date.now() ? null : saved ?? null }
    },
    onRehydrateStorage: () => (state) => {
      if (state?.session) scheduleExpiration(state.session.token, state.clearSession)
    },
  },
))
