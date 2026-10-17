import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ClientSession } from '../types/session'

interface SessionState {
  session: ClientSession | null
  setSession: (session: ClientSession) => void
  clearSession: () => void
}

// sessionStorage mantiene la sesión únicamente durante la pestaña actual. La
// contraseña nunca forma parte del estado ni del almacenamiento del navegador.
export const useClientSession = create<SessionState>()(persist(
  (set) => ({
    session: null,
    setSession: (session) => set({ session }),
    clearSession: () => set({ session: null }),
  }),
  {
    name: 'selava-client-session',
    storage: createJSONStorage(() => sessionStorage),
  },
))
