import { create } from 'zustand'
import type { ClientSession } from '../types/session'

interface SessionState {
  session: ClientSession | null
  setSession: (session: ClientSession) => void
  clearSession: () => void
}

// Sin persistencia ni credenciales de demostracion. Ninguna pantalla inicia
// sesion hasta que exista soporte de autenticacion de clientes en backend.
export const useClientSession = create<SessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}))
