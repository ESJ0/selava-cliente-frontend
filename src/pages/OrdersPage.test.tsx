import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getOwnOrderDetail, getOwnOrderHistory, getOwnOrders } from '../api/orders'
import { AppRoutes } from '../routes/AppRoutes'
import { useClientSession } from '../store/session'

vi.mock('../api/orders', () => ({ getOwnOrders: vi.fn(), getOwnOrderDetail: vi.fn(), getOwnOrderHistory: vi.fn() }))
const listMock = vi.mocked(getOwnOrders)
const detailMock = vi.mocked(getOwnOrderDetail)
const historyMock = vi.mocked(getOwnOrderHistory)

function renderAt(path: string) {
  useClientSession.getState().setSession({ customer: { id: 42, nombre: 'Ana', apellido: 'López' }, token: 'jwt' })
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

beforeEach(() => {
  listMock.mockReset()
  detailMock.mockReset()
  historyMock.mockReset()
})

describe('pedidos del cliente SEL-105', () => {
  it('muestra carga y luego el estado vacío', async () => {
    listMock.mockResolvedValue({ pedidos: [], total: 0, pagina: 1, limite: 100 })
    renderAt('/mis-pedidos')
    expect(screen.getByRole('status')).toHaveTextContent('Cargando pedidos')
    expect(await screen.findByRole('heading', { name: 'Aún no tienes pedidos.' })).toBeInTheDocument()
  })

  it('lista únicamente los pedidos entregados por la API del cliente', async () => {
    listMock.mockResolvedValue({
      pedidos: [{ id: 7, fecha_recibido: '2026-10-15T14:00:00Z', fecha_entrega_estimada: '2026-10-18T14:00:00Z', total: 75.5, estado_actual: { id: 2, nombre: 'Rackeado', orden: 2 } }],
      total: 1, pagina: 1, limite: 100,
    })
    renderAt('/mis-pedidos')
    const link = await screen.findByRole('link', { name: 'Ver pedido SLV-0007' })
    expect(link).toHaveAttribute('href', '/mis-pedidos/7')
    expect(within(link).getByText('Rackeado')).toBeInTheDocument()
    expect(within(link).getByText(/75[.,]50/)).toBeInTheDocument()
  })

  it('muestra error y permite reintentar', async () => {
    const user = userEvent.setup()
    listMock.mockRejectedValueOnce(new Error('fallo')).mockResolvedValueOnce({ pedidos: [], total: 0, pagina: 1, limite: 100 })
    renderAt('/mis-pedidos')
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus pedidos')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByRole('heading', { name: 'Aún no tienes pedidos.' })).toBeInTheDocument()
    expect(listMock).toHaveBeenCalledTimes(2)
  })

  it('muestra prendas, servicios, importes, fechas y timeline del pedido', async () => {
    detailMock.mockResolvedValue({
      id: 7, fecha_recibido: '2026-10-15T14:00:00Z', fecha_entrega_estimada: '2026-10-18T14:00:00Z', total: 75.5,
      estado_actual: { id: 2, nombre: 'Rackeado', orden: 2 }, observaciones: 'Tratar con cuidado',
      prendas: [{ id: 3, tipo_prenda_id: 1, tipo_prenda: { id: 1, nombre: 'Camisa' }, cantidad: 2, color: 'Azul', servicios: [{ id: 8, servicio_id: 2, precio_aplicado: 25, servicio: { id: 2, nombre: 'Lavado en seco', precio_base: 25 } }] }],
    })
    historyMock.mockResolvedValue([
      { id: 1, pedido_id: 7, estado: { id: 1, nombre: 'Recibido', orden: 1 }, fecha_cambio: '2026-10-15T14:00:00Z' },
      { id: 2, pedido_id: 7, estado: { id: 2, nombre: 'Rackeado', orden: 2 }, fecha_cambio: '2026-10-16T14:00:00Z', observaciones: 'Listo para rack' },
    ])
    renderAt('/mis-pedidos/7')
    expect(await screen.findByRole('heading', { name: 'SLV-0007' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Camisa' })).toBeInTheDocument()
    expect(screen.getByText('Lavado en seco')).toBeInTheDocument()
    expect(screen.getByText('Tratar con cuidado')).toBeInTheDocument()
    const timeline = screen.getByRole('list', { name: 'Historial de estados' })
    expect(within(timeline).getByText('Recibido')).toBeInTheDocument()
    expect(within(timeline).getByText('Listo para rack')).toBeInTheDocument()
  })
})
