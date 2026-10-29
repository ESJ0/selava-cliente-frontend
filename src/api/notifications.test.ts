import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { afterEach, expect, it } from 'vitest'
import { useClientSession } from '../store/session'
import { authenticatedApi } from './client'
import { deleteOwnNotification, getOwnNotifications, markAllOwnNotificationsRead, markOwnNotificationRead } from './notifications'

const originalAdapter = authenticatedApi.defaults.adapter
afterEach(() => { authenticatedApi.defaults.adapter = originalAdapter; useClientSession.getState().clearSession() })

it('consume las cuatro operaciones privadas de notificaciones con el JWT del cliente', async () => {
  useClientSession.getState().setSession({ customer: { id: 42, nombre: 'Ana' }, token: 'jwt-cliente' })
  const calls: Array<{ method?: string; url?: string; authorization?: string }> = []
  authenticatedApi.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
    calls.push({ method: config.method, url: config.url, authorization: config.headers.get('Authorization') as string })
    const data = config.method === 'get'
      ? { notificaciones: [], no_leidas: 0 }
      : config.url?.endsWith('/leidas')
        ? { actualizadas: 2 }
        : { id: 7, cliente_id: 42, mensaje: 'Pedido actualizado', leida: true, created_at: '2026-10-28T10:00:00Z' }
    return { config, status: config.method === 'delete' ? 204 : 200, statusText: 'OK', headers: {}, data }
  }) as AxiosAdapter

  await getOwnNotifications()
  await markOwnNotificationRead(7)
  await markAllOwnNotificationsRead()
  await deleteOwnNotification(7)

  expect(calls).toEqual([
    { method: 'get', url: '/cliente/notificaciones/', authorization: 'Bearer jwt-cliente' },
    { method: 'patch', url: '/cliente/notificaciones/7/leida', authorization: 'Bearer jwt-cliente' },
    { method: 'patch', url: '/cliente/notificaciones/leidas', authorization: 'Bearer jwt-cliente' },
    { method: 'delete', url: '/cliente/notificaciones/7', authorization: 'Bearer jwt-cliente' },
  ])
})

it('normaliza una respuesta sin arreglo ni contador', async () => {
  authenticatedApi.defaults.adapter = (async (config: InternalAxiosRequestConfig) => ({ config, status: 200, statusText: 'OK', headers: {}, data: {} })) as AxiosAdapter
  await expect(getOwnNotifications()).resolves.toEqual({ notificaciones: [], no_leidas: 0 })
})
