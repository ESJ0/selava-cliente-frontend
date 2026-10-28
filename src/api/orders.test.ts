import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { afterEach, expect, it } from 'vitest'
import { useClientSession } from '../store/session'
import type { OwnOrderDetail, OwnOrderHistoryEntry } from '../types/order'
import { authenticatedApi } from './client'
import { getOwnOrderDetail, getOwnOrderHistory, getOwnOrders } from './orders'

const originalAdapter = authenticatedApi.defaults.adapter
afterEach(() => { authenticatedApi.defaults.adapter = originalAdapter; useClientSession.getState().clearSession() })

it('consume listado, detalle e historial con el JWT del cliente', async () => {
  useClientSession.getState().setSession({ customer: { id: 42, nombre: 'Ana', apellido: 'López' }, token: 'jwt-cliente' })
  const calls: string[] = []
  const detailResponse: OwnOrderDetail = {
    id: 7,
    fecha_recibido: '2026-10-27T08:00:00Z',
    total: 75,
    prendas: [],
    estado_actual: { id: 2, nombre: 'En lavado', codigo: 'EN_LAVADO', orden: 20 },
    flujo_operativo: {
      estados: [
        { id: 2, nombre: 'En lavado', codigo: 'EN_LAVADO', orden: 20, servicios: [{ id: 4, nombre: 'Lavado' }], completado: true, actual: true },
        { id: 1, nombre: 'Recibido', codigo: 'RECIBIDO', orden: 10, servicios: [], completado: true, actual: false },
      ],
      progreso_porcentaje: 100,
      cancelado: false,
    },
  }
  const historyResponse: OwnOrderHistoryEntry[] = [
    { id: 1, pedido_id: 7, estado: { id: 1, nombre: 'Recibido', orden: 10 }, fecha_cambio: '2026-10-27T08:00:00Z' },
    { id: 2, pedido_id: 7, estado: { id: 2, nombre: 'En lavado', orden: 20 }, fecha_cambio: '2026-10-27T10:00:00Z' },
  ]
  authenticatedApi.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
    calls.push(`${config.url}:${config.headers.get('Authorization')}`)
    const data = config.url?.endsWith('historial-estados') ? historyResponse : config.url === '/cliente/pedidos' ? { pedidos: [], total: 0, pagina: 1, limite: 20 } : detailResponse
    return { config, status: 200, statusText: 'OK', headers: {}, data }
  }) as AxiosAdapter

  await getOwnOrders({ pagina: 1 })
  const detail = await getOwnOrderDetail(7)
  const history = await getOwnOrderHistory(7)
  expect(calls).toEqual([
    '/cliente/pedidos:Bearer jwt-cliente',
    '/cliente/pedidos/7:Bearer jwt-cliente',
    '/cliente/pedidos/7/historial-estados:Bearer jwt-cliente',
  ])
  expect(detail.estado_actual.codigo).toBe('EN_LAVADO')
  expect(detail.flujo_operativo.estados[1].servicios).toEqual([{ id: 4, nombre: 'Lavado' }])
  expect(detail.flujo_operativo.estados.map((stage) => stage.codigo)).toEqual(['RECIBIDO', 'EN_LAVADO'])
  expect(history.map((entry) => entry.estado.nombre)).toEqual(['Recibido', 'En lavado'])
})
