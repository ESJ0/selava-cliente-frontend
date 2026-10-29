import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ClientNotification } from '../types/notification'
import { NotificationCenter } from './NotificationCenter'

const notificationApi = vi.hoisted(() => ({
  deleteOwnNotification: vi.fn(),
  getOwnNotifications: vi.fn(),
  markAllOwnNotificationsRead: vi.fn(),
  markOwnNotificationRead: vi.fn(),
}))

vi.mock('../api/notifications', () => notificationApi)

const unread: ClientNotification = {
  id: 8,
  cliente_id: 42,
  pedido_id: 15,
  mensaje: 'Tu pedido #15 cambió al estado Rackeado.',
  leida: false,
  created_at: '2026-10-28T10:00:00Z',
}

function renderCenter() {
  return render(<MemoryRouter><NotificationCenter /></MemoryRouter>)
}

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    notificationApi.getOwnNotifications.mockResolvedValue({ notificaciones: [unread], no_leidas: 1 })
    notificationApi.markOwnNotificationRead.mockResolvedValue({ ...unread, leida: true })
    notificationApi.markAllOwnNotificationsRead.mockResolvedValue({ actualizadas: 1 })
    notificationApi.deleteOwnNotification.mockResolvedValue(undefined)
  })

  afterEach(cleanup)

  it('muestra el contador y permite marcar una notificación como leída', async () => {
    const user = userEvent.setup()
    renderCenter()
    const bell = await screen.findByRole('button', { name: 'Notificaciones: 1 sin leer' })
    await user.click(bell)
    const panel = screen.getByRole('region', { name: 'Panel de notificaciones' })
    expect(within(panel).getByText(unread.mensaje)).toBeInTheDocument()
    await user.click(within(panel).getByRole('button', { name: 'Marcar como leída' }))
    await waitFor(() => expect(notificationApi.markOwnNotificationRead).toHaveBeenCalledWith(8))
    expect(screen.getByRole('button', { name: 'Notificaciones: 0 sin leer' })).toBeInTheDocument()
  })

  it('elimina una notificación del historial', async () => {
    const user = userEvent.setup()
    renderCenter()
    await user.click(await screen.findByRole('button', { name: 'Notificaciones: 1 sin leer' }))
    const panel = screen.getByRole('region', { name: 'Panel de notificaciones' })
    await user.click(within(panel).getByRole('button', { name: 'Eliminar notificación 8' }))
    await waitFor(() => expect(notificationApi.deleteOwnNotification).toHaveBeenCalledWith(8))
    expect(within(panel).getByText('Aún no tienes notificaciones.')).toBeInTheDocument()
  })

  it('marca todas las notificaciones como leídas', async () => {
    const user = userEvent.setup()
    renderCenter()
    await user.click(await screen.findByRole('button', { name: 'Notificaciones: 1 sin leer' }))
    await user.click(screen.getByRole('button', { name: 'Marcar todas como leídas' }))
    await waitFor(() => expect(notificationApi.markAllOwnNotificationsRead).toHaveBeenCalledOnce())
    expect(screen.getByRole('button', { name: 'Notificaciones: 0 sin leer' })).toBeInTheDocument()
  })
})
