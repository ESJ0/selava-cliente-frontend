import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, expect, it } from 'vitest'
import { api, authenticatedApi } from './client'
import { authErrorDetails, loginClient, registerClient } from './clientAuth'

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
    expect(config.url).toBe('/auth/clientes/login')
    expect(JSON.parse(String(config.data))).toEqual({ email: 'ana@example.com', password: 'secreto-seguro' })
    return response(config, { token: 'jwt-cliente' })
  }) satisfies AxiosAdapter
  authenticatedApi.defaults.adapter = (async (config) => {
    expect(config.url).toBe('/cliente/me')
    expect(config.headers.get('Authorization')).toBe('Bearer jwt-cliente')
    return response(config, { id: 4, nombre: 'Ana', apellido: 'López', email: 'ana@example.com' })
  }) satisfies AxiosAdapter

  expect(await loginClient('ana@example.com', 'secreto-seguro')).toEqual({
    token: 'jwt-cliente', customer: { id: 4, nombre: 'Ana', apellido: 'López', email: 'ana@example.com' },
  })
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
