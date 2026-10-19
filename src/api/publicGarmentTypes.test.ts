import { afterEach, expect, it } from 'vitest'
import { AxiosError } from 'axios'
import { api } from './client'
import { getPublicGarmentTypes } from './publicGarmentTypes'
import { useClientSession } from '../store/session'

const originalAdapter = api.defaults.adapter
afterEach(() => { api.defaults.adapter = originalAdapter; useClientSession.getState().clearSession() })

it('consulta precios de prendas sin JWT incluso con una sesión activa', async () => {
  useClientSession.getState().setSession({ customer: { id: 7, nombre: 'Ana', apellido: 'Pérez' }, token: 'test-only' })
  const signal = new AbortController().signal
  const catalog = [{ id: 2, nombre: 'Camisa', descripcion: null, precio: 25.50 }]
  api.defaults.adapter = async config => {
    expect(config.url).toBe('/public/tipos-prenda'); expect(config.signal).toBe(signal)
    expect(config.headers.get('Authorization')).toBeUndefined()
    return { config, status: 200, statusText: 'OK', headers: {}, data: catalog }
  }
  expect(await getPublicGarmentTypes(signal)).toEqual(catalog)
})

it('conserva lista vacía y propaga error de red', async () => {
  api.defaults.adapter = async config => ({ config, status: 200, statusText: 'OK', headers: {}, data: [] })
  expect(await getPublicGarmentTypes()).toEqual([])
  const error = new AxiosError('Network Error', 'ERR_NETWORK'); api.defaults.adapter = async () => { throw error }
  await expect(getPublicGarmentTypes()).rejects.toBe(error)
})
