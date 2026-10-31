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
    const user = userEvent.setup()
    const ticket = within((await screen.findByRole('heading', { name: 'SLV-0007' })).closest('article')!)
    expect(ticket.getByRole('status', { name: 'Estado actual: Rackeado' })).toHaveTextContent('Rackeado')
    expect(ticket.getByText(/75[.,]50/)).toBeInTheDocument()
    await user.click(ticket.getByRole('button', { name: 'Ver detalle' }))
    expect(ticket.getByRole('link', { name: /Ver pedido completo/ })).toHaveAttribute('href', '/mis-pedidos/7')
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

  it('muestra prendas, servicios, progreso aplicable e historial del pedido', async () => {
    detailMock.mockResolvedValue({
      id: 7, fecha_recibido: '2026-10-15T14:00:00Z', fecha_entrega_estimada: '2026-10-18T14:00:00Z', total: 75.5,
      estado_actual: { id: 2, nombre: 'Rackeado', orden: 2 }, observaciones: 'Tratar con cuidado',
      flujo_operativo: {
        estados: [
          { id: 1, nombre: 'Recibido', codigo: 'RECIBIDO', orden: 10, servicios: [], completado: true, actual: false },
          { id: 2, nombre: 'En lavado', codigo: 'EN_LAVADO', orden: 20, servicios: [{ id: 2, nombre: 'Lavado en seco' }], completado: true, actual: false },
          { id: 3, nombre: 'Rackeado', codigo: 'RACKEADO', orden: 50, servicios: [], completado: true, actual: true },
          { id: 4, nombre: 'Finalizado', codigo: 'FINALIZADO', orden: 60, servicios: [], completado: false, actual: false },
        ],
        progreso_porcentaje: 75,
        cancelado: false,
      },
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
    const progress = screen.getByRole('list', { name: 'Progreso del pedido' })
    expect(within(progress).getAllByRole('listitem')).toHaveLength(4)
    expect(within(progress).getByText('Rackeado').closest('li')).toHaveAttribute('aria-current', 'step')
    expect(within(progress).queryByText('En planchado')).not.toBeInTheDocument()
    const timeline = screen.getByRole('list', { name: 'Historial de estados' })
    expect(within(timeline).getByText('Recibido')).toBeInTheDocument()
    expect(within(timeline).getByText('Listo para rack')).toBeInTheDocument()
  })

  it('filtra por estado y busca por código sin consultar de nuevo la API', async () => {
    const user = userEvent.setup()
    listMock.mockResolvedValue({
      pedidos: [
        { id: 15, fecha_recibido: '2026-10-30T14:00:00Z', total: 300, estado_actual: { id: 3, nombre: 'En planchado', orden: 3 } },
        { id: 9, fecha_recibido: '2026-10-01T14:00:00Z', total: 50, estado_actual: { id: 5, nombre: 'Entregado', orden: 5 } },
      ],
      total: 2, pagina: 1, limite: 100,
    })
    renderAt('/mis-pedidos')
    expect(await screen.findByRole('heading', { name: 'SLV-0015' })).toBeInTheDocument()
    expect(screen.getByText(/Q\s*350\.00/)).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Entregados/ }))
    expect(screen.queryByRole('heading', { name: 'SLV-0015' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'SLV-0009' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Todos/ }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar pedido' }), 'slv-0015')
    expect(screen.getByRole('heading', { name: 'SLV-0015' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'SLV-0009' })).not.toBeInTheDocument()
    await user.clear(screen.getByRole('searchbox', { name: 'Buscar pedido' }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar pedido' }), 'SLV-9999')
    expect(screen.getByRole('heading', { name: 'No encontramos ese pedido' })).toBeInTheDocument()
    expect(listMock).toHaveBeenCalledTimes(1)
  })
})
