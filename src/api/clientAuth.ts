import axios from 'axios'
import { api, authenticatedApi } from './client'
import type { ClientSession } from '../types/session'

export interface ClientRegistration {
  nombre: string
  apellido: string
  telefono: string
  email: string
  direccion: string
  password: string
}

interface RegisteredClientResponse {
  cliente: {
    id: number
    nombre: string
    apellido: string
    telefono: string
    email?: string
    direccion?: string
    activo: boolean
  }
}

interface LoginResponse {
  token: string
  destino: 'cliente' | 'admin'
  usuario: {
    id: number
    rol_id: number
    rol: string
    cliente_id?: number
    nombre: string
    apellido: string
    email: string
  }
}

interface ClientIdentityResponse {
  id: number
}

interface ApiFieldError {
  field: string
  message: string
}

interface ApiErrorResponse {
  error?: string
  errores?: ApiFieldError[]
}

export interface AuthErrorDetails {
  message: string
  fields: Record<string, string>
}

export async function registerClient(data: ClientRegistration): Promise<RegisteredClientResponse> {
  const response = await api.post<RegisteredClientResponse>('/auth/clientes/registro', data)
  return response.data
}

export type UnifiedLoginResult =
  | { kind: 'cliente'; session: ClientSession }
  | { kind: 'admin'; token: string; roleId: number; role: string }

export async function loginUnified(email: string, password: string): Promise<UnifiedLoginResult> {
  const loginResponse = await api.post<LoginResponse>('/auth/login', { email, password })
  const token = loginResponse.data.token
  if (loginResponse.data.destino === 'admin') {
    return { kind: 'admin', token, roleId: loginResponse.data.usuario.rol_id, role: loginResponse.data.usuario.rol }
  }
  const identityResponse = await authenticatedApi.get<ClientIdentityResponse>('/cliente/me', {
    headers: { Authorization: `Bearer ${token}` },
  })

  return { kind: 'cliente', session: {
    token,
    customer: { id: identityResponse.data.id, email: loginResponse.data.usuario.email, nombre: loginResponse.data.usuario.nombre, apellido: loginResponse.data.usuario.apellido },
  } }
}

export function adminHandoffURL(token: string): string {
  const adminURL = (import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173').replace(/\/+$/, '')
  return `${adminURL}/auth/callback#token=${encodeURIComponent(token)}`
}

export async function requestPasswordReset(email: string): Promise<string> {
  const { data } = await api.post<{ mensaje: string }>('/auth/password/forgot', { email })
  return data.mensaje
}

export async function validatePasswordResetToken(token: string, signal?: AbortSignal): Promise<void> {
  await api.get('/auth/password/reset/validate', { params: { token }, signal })
}

export async function resetPassword(token: string, password: string): Promise<string> {
  const { data } = await api.post<{ mensaje: string }>('/auth/password/reset', { token, password })
  return data.mensaje
}

export function authErrorDetails(error: unknown, fallback: string): AuthErrorDetails {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return { message: fallback, fields: {} }
  if (!error.response) {
    return { message: 'No pudimos conectar con SeLava. Revisa tu conexión e inténtalo de nuevo.', fields: {} }
  }

  const fields = Object.fromEntries(
    (error.response.data?.errores ?? []).map(({ field, message }) => [field, message]),
  )

  if (error.response.status === 401) {
    return { message: 'El correo o la contraseña son incorrectos.', fields }
  }
  if (error.response.status === 409) {
    return { message: error.response.data?.error ?? 'Ya existe una cuenta con este correo.', fields }
  }
  if (error.response.status === 422) {
    return { message: 'Revisa los datos señalados antes de continuar.', fields }
  }

  return { message: error.response.data?.error ?? fallback, fields }
}
