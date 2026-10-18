import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { afterEach, expect, it } from 'vitest'
import { useClientSession } from '../store/session'
import { authenticatedApi } from './client'
import { getOwnOrderDetail, getOwnOrderHistory, getOwnOrders } from './orders'

const originalAdapter = authenticatedApi.defaults.adapter
afterEach(() => { authenticatedApi.defaults.adapter = originalAdapter; useClientSession.getState().clearSession() })

it('consume listado, detalle e historial con el JWT del cliente', async () => {
  useClientSession.getState().setSession({ customer: { id: 42, nombre: 'Ana', apellido: 'López' }, token: 'jwt-cliente' })
  const calls: string[] = []
  authenticatedApi.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
    calls.push(`${config.url}:${config.headers.get('Authorization')}`)
    const data = config.url?.endsWith('historial-estados') ? [] : config.url === '/cliente/pedidos' ? { pedidos: [], total: 0, pagina: 1, limite: 20 } : { id: 7, prendas: [] }
    return { config, status: 200, statusText: 'OK', headers: {}, data }
  }) as AxiosAdapter

  await getOwnOrders({ pagina: 1 })
  await getOwnOrderDetail(7)
  await getOwnOrderHistory(7)
  expect(calls).toEqual([
    '/cliente/pedidos:Bearer jwt-cliente',
    '/cliente/pedidos/7:Bearer jwt-cliente',
    '/cliente/pedidos/7/historial-estados:Bearer jwt-cliente',
  ])
})
