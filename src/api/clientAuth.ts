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
}

interface ClientIdentityResponse {
  id: number
  nombre: string
  apellido: string
  email?: string
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

export async function loginClient(email: string, password: string): Promise<ClientSession> {
  const loginResponse = await api.post<LoginResponse>('/auth/clientes/login', { email, password })
  const token = loginResponse.data.token
  const identityResponse = await authenticatedApi.get<ClientIdentityResponse>('/cliente/me', {
    headers: { Authorization: `Bearer ${token}` },
  })

  return {
    token,
    customer: {
      id: identityResponse.data.id,
      nombre: identityResponse.data.nombre,
      apellido: identityResponse.data.apellido,
      email: identityResponse.data.email ?? email.trim().toLowerCase(),
    },
  }
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
