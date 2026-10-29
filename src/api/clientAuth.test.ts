import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, expect, it } from 'vitest'
import { api, authenticatedApi } from './client'
import { adminHandoffURL, authErrorDetails, loginUnified, registerClient, requestPasswordReset, resetPassword, validatePasswordResetToken } from './clientAuth'

const publicAdapter = api.defaults.adapter
const privateAdapter = authenticatedApi.defaults.adapter

afterEach(() => {
  api.defaults.adapter = publicAdapter
  authenticatedApi.defaults.adapter = privateAdapter
})

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200) {
  return { config, data, status, statusText: status === 200 ? 'OK' : 'Error', headers: {} }
}

it('registra el perfil y las credenciales con el contrato del backend', async () => {
  const payload = { nombre: 'Ana', apellido: 'López', telefono: '5555-1234', email: 'ana@example.com', direccion: 'Zona 1', password: 'secreto-seguro' }
  const apiResponse = { cliente: { id: 4, nombre: 'Ana', apellido: 'López', telefono: '5555-1234', email: 'ana@example.com', activo: true } }
  api.defaults.adapter = (async (config) => {
    expect(config.url).toBe('/auth/clientes/registro')
    expect(config.method).toBe('post')
    expect(JSON.parse(String(config.data))).toEqual(payload)
    expect(config.headers.get('Authorization')).toBeUndefined()
    return response(config, apiResponse, 201)
  }) satisfies AxiosAdapter

  expect(await registerClient(payload)).toEqual(apiResponse)
})

it('valida el JWT recibido antes de construir la sesión del cliente', async () => {
  api.defaults.adapter = (async (config) => {
    expect(config.url).toBe('/auth/login')
    expect(JSON.parse(String(config.data))).toEqual({ email: 'ana@example.com', password: 'secreto-seguro' })
    return response(config, { token: 'jwt-cliente', destino: 'cliente', usuario: { id: 9, rol_id: 4, rol: 'Cliente', cliente_id: 4, nombre: 'Ana', apellido: 'López', email: 'ana@example.com' } })
  }) satisfies AxiosAdapter
  authenticatedApi.defaults.adapter = (async (config) => {
    expect(config.url).toBe('/cliente/me')
    expect(config.headers.get('Authorization')).toBe('Bearer jwt-cliente')
    return response(config, { id: 4 })
  }) satisfies AxiosAdapter

  expect(await loginUnified('ana@example.com', 'secreto-seguro')).toEqual({
    kind: 'cliente', session: { token: 'jwt-cliente', customer: { id: 4, email: 'ana@example.com', nombre: 'Ana', apellido: 'López' } },
  })
})

it('devuelve el traspaso para roles internos sin consultar el perfil cliente', async () => {
  api.defaults.adapter = (async (config) => response(config, { token: 'jwt-admin', destino: 'admin', usuario: { id: 1, rol_id: 1, rol: 'Administrador', nombre: 'Admin', apellido: 'SeLava', email: 'admin@selava.local' } })) satisfies AxiosAdapter
  await expect(loginUnified('admin@selava.local', 'secreto')).resolves.toEqual({ kind: 'admin', token: 'jwt-admin', roleId: 1, role: 'Administrador' })
  expect(adminHandoffURL('jwt admin')).toBe('http://localhost:5173/auth/callback#token=jwt%20admin')
})

it('consume solicitud, validación y cambio de contraseña', async () => {
  const calls: string[] = []
  api.defaults.adapter = (async (config) => {
    calls.push(`${config.method} ${config.url}`)
    return response(config, config.url?.endsWith('/forgot') ? { mensaje: 'Revisa tu correo.' } : config.method === 'get' ? { valido: true } : { mensaje: 'Contraseña actualizada.' })
  }) satisfies AxiosAdapter
  await expect(requestPasswordReset('ana@example.com')).resolves.toBe('Revisa tu correo.')
  await expect(validatePasswordResetToken('token')).resolves.toBeUndefined()
  await expect(resetPassword('token', 'password-seguro')).resolves.toBe('Contraseña actualizada.')
  expect(calls).toEqual(['post /auth/password/forgot', 'get /auth/password/reset/validate', 'post /auth/password/reset'])
})

it('convierte errores de validación, duplicados y red en mensajes de formulario', () => {
  const config = { headers: {} } as InternalAxiosRequestConfig
  const validationError = new AxiosError('invalid', 'ERR_BAD_REQUEST', config, undefined, {
    config, status: 422, statusText: 'Unprocessable Entity', headers: {},
    data: { errores: [{ field: 'email', message: 'formato inválido' }] },
  })
  expect(authErrorDetails(validationError, 'fallback')).toEqual({
    message: 'Revisa los datos señalados antes de continuar.', fields: { email: 'formato inválido' },
  })

  const conflictError = new AxiosError('conflict', 'ERR_BAD_REQUEST', config, undefined, {
    config, status: 409, statusText: 'Conflict', headers: {}, data: { error: 'correo en uso' },
  })
  expect(authErrorDetails(conflictError, 'fallback').message).toBe('correo en uso')
  expect(authErrorDetails(new AxiosError('network', 'ERR_NETWORK'), 'fallback').message).toMatch(/No pudimos conectar/)
})
