import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { afterEach, expect, it } from 'vitest'
import { useClientSession } from '../store/session'
import { authenticatedApi } from './client'
import { getOwnOrderBalance, getOwnOrderPayments } from './payments'

const originalAdapter = authenticatedApi.defaults.adapter
afterEach(() => { authenticatedApi.defaults.adapter = originalAdapter; useClientSession.getState().clearSession() })

it('consulta pagos y saldo del pedido con el JWT del cliente', async () => {
  useClientSession.getState().setSession({ customer: { id: 42, nombre: 'Ana' }, token: 'jwt-cliente' })
  const calls: string[] = []
  authenticatedApi.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
    calls.push(`${config.url}:${config.headers.get('Authorization')}`)
    const data = config.url?.endsWith('/saldo')
      ? { pedido_id: 7, total: 100, total_pagado: 25, saldo_pendiente: 75 }
      : [{ id: 1, pedido_id: 7, monto: 25, fecha_pago: '2026-10-19T10:00:00Z', metodo_pago: { id: 2, nombre: 'Transferencia' } }]
    return { config, status: 200, statusText: 'OK', headers: {}, data }
  }) as AxiosAdapter

  const pagos = await getOwnOrderPayments(7)
  const saldo = await getOwnOrderBalance(7)

  expect(calls).toEqual([
    '/cliente/pedidos/7/pagos:Bearer jwt-cliente',
    '/cliente/pedidos/7/saldo:Bearer jwt-cliente',
  ])
  expect(pagos[0]).not.toHaveProperty('usuario_id')
  expect(pagos[0].metodo_pago.nombre).toBe('Transferencia')
  expect(saldo.saldo_pendiente).toBe(75)
})

it('conserva un historial vacio', async () => {
  authenticatedApi.defaults.adapter = (async (config: InternalAxiosRequestConfig) => ({ config, status: 200, statusText: 'OK', headers: {}, data: [] })) as AxiosAdapter
  await expect(getOwnOrderPayments(8)).resolves.toEqual([])
})
