import axios from 'axios'
import { useClientSession } from '../store/session'

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/+$/, '')

const defaults = {
  baseURL,
  timeout: 8000,
  headers: { Accept: 'application/json' },
}

export const api = axios.create(defaults)

// Solo la instancia privada usara el futuro JWT de cliente. El catalogo
// publico permanece sin Authorization aun cuando exista una sesion.
export const authenticatedApi = axios.create(defaults)
authenticatedApi.interceptors.request.use((config) => {
  const token = useClientSession.getState().session?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
authenticatedApi.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) useClientSession.getState().clearSession()
  return Promise.reject(error)
})

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.'
    if (error.response.status === 401) return 'Tu sesión terminó. Vuelve a iniciar sesión.'
    if (error.response.status === 403) return 'No tienes permiso para consultar esta información.'
  }
  return 'No pudimos cargar la información. Inténtalo de nuevo en unos momentos.'
}
