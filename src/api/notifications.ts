import type { ClientNotification, ClientNotificationsResponse } from '../types/notification'
import { authenticatedApi } from './client'

export async function getOwnNotifications(signal?: AbortSignal): Promise<ClientNotificationsResponse> {
  const { data } = await authenticatedApi.get<ClientNotificationsResponse>('/cliente/notificaciones/', { signal })
  return { notificaciones: data.notificaciones ?? [], no_leidas: data.no_leidas ?? 0 }
}

export async function markOwnNotificationRead(notificationId: number): Promise<ClientNotification> {
  const { data } = await authenticatedApi.patch<ClientNotification>(`/cliente/notificaciones/${notificationId}/leida`)
  return data
}

export async function markAllOwnNotificationsRead(): Promise<number> {
  const { data } = await authenticatedApi.patch<{ actualizadas: number }>('/cliente/notificaciones/leidas')
  return data.actualizadas
}

export async function deleteOwnNotification(notificationId: number): Promise<void> {
  await authenticatedApi.delete(`/cliente/notificaciones/${notificationId}`)
}
