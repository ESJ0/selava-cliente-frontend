import { create } from 'zustand'
import { getClientProfile, getClientProfilePhoto } from '../api/profile'

interface ProfilePhotoState {
  /** URL local (blob) de la foto del cliente, o null si no tiene. */
  url: string | null
  loadedFor: number | null
  /** Carga la foto una vez por cliente; con force vuelve a consultarla (p. ej. tras cambiarla). */
  load: (customerId: number, force?: boolean) => Promise<void>
  clear: () => void
}

let pending: Promise<void> | null = null

function release(url: string | null) {
  if (url) URL.revokeObjectURL(url)
}

/** Foto de perfil compartida entre el encabezado y la página de perfil. */
export const useProfilePhoto = create<ProfilePhotoState>((set, get) => ({
  url: null,
  loadedFor: null,
  load: async (customerId, force = false) => {
    if (!force && get().loadedFor === customerId) return
    if (!force && pending) return pending
    pending = (async () => {
      try {
        const profile = await getClientProfile()
        const url = profile.tiene_foto_perfil ? URL.createObjectURL(await getClientProfilePhoto()) : null
        release(get().url)
        set({ url, loadedFor: customerId })
      } catch {
        set({ loadedFor: customerId })
      } finally {
        pending = null
      }
    })()
    return pending
  },
  clear: () => {
    release(get().url)
    set({ url: null, loadedFor: null })
  },
}))
