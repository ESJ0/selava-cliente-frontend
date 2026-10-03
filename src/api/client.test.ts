import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { api, authenticatedApi, errorMessage } from './client'
import { getPublicServices } from './publicServices'
import { useClientSession } from '../store/session'

const publicAdapter = api.defaults.adapter
const privateAdapter = authenticatedApi.defaults.adapter
beforeEach(() => useClientSession.getState().clearSession())
afterEach(() => {
  api.defaults.adapter = publicAdapter
  authenticatedApi.defaults.adapter = privateAdapter
  useClientSession.getState().clearSession()
})

function captureAdapter(onRequest: (config: InternalAxiosRequestConfig) => unknown): AxiosAdapter {
  return async (config) => ({ config, status: 200, statusText: 'OK', headers: {}, data: onRequest(config) })
}

it('consulta el contrato SEL-93 sin JWT y conserva precios y campos null', async () => {
  useClientSession.getState().setSession({ customer: { id: 7, nombre: 'Ana', apellido: 'Pérez' }, token: 'test-session-only' })
  const catalog = [{ id: 1, nombre: 'Servicio de prueba', descripcion: null, precio_base: 37.25, tiempo_estimado_horas: null }]
  const signal = new AbortController().signal
  api.defaults.adapter = captureAdapter((config) => {
    expect(config.url).toBe('/public/servicios')
    expect(config.method).toBe('get')
    expect(config.signal).toBe(signal)
    expect(config.headers.get('Authorization')).toBeUndefined()
    return catalog
  })
  expect(await getPublicServices(signal)).toEqual(catalog)
})

it('conserva el arreglo vacío del catálogo', async () => {
  api.defaults.adapter = captureAdapter(() => [])
  expect(await getPublicServices()).toEqual([])
})

it('adjunta JWT exclusivamente a la instancia preparada para autenticación', async () => {
  useClientSession.getState().setSession({ customer: { id: 7, nombre: 'Ana', apellido: 'Pérez' }, token: 'test-session-only' })
  authenticatedApi.defaults.adapter = captureAdapter((config) => {
    expect(config.headers.get('Authorization')).toBe('Bearer test-session-only')
    return {}
  })
  await authenticatedApi.get('/test-only')
})

it('limpia una sesión expirada y conserva el error para el consumidor', async () => {
  useClientSession.getState().setSession({ customer: { id: 7, nombre: 'Ana', apellido: 'Pérez' }, token: 'test-session-only' })
  authenticatedApi.defaults.adapter = async (config) => {
    throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, { config, status: 401, statusText: 'Unauthorized', headers: {}, data: {} })
  }
  await expect(authenticatedApi.get('/test-only')).rejects.toBeInstanceOf(AxiosError)
  expect(useClientSession.getState().session).toBeNull()
})

it('propaga fallos de red y ofrece un mensaje humano', async () => {
  const error = new AxiosError('Network Error', 'ERR_NETWORK')
  api.defaults.adapter = async () => { throw error }
  await expect(getPublicServices()).rejects.toBe(error)
  expect(errorMessage(error)).toBe('No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.')
  expect(errorMessage(new Error('internal detail'))).not.toContain('internal detail')
})
