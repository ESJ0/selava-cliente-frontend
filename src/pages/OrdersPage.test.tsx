import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getOwnGarmentTypes, getOwnOrderDetail, getOwnOrderHistory, getOwnOrders } from '../api/orders'
import { AppRoutes } from '../routes/AppRoutes'
import { useClientSession } from '../store/session'
import type { OwnOrderSummary, OwnOrdersParams, OwnOrdersResponse } from '../types/order'

vi.mock('../api/orders', () => ({ getOwnOrders: vi.fn(), getOwnOrderDetail: vi.fn(), getOwnOrderHistory: vi.fn(), getOwnGarmentTypes: vi.fn() }))
const listMock = vi.mocked(getOwnOrders)
const detailMock = vi.mocked(getOwnOrderDetail)
const historyMock = vi.mocked(getOwnOrderHistory)
const typesMock = vi.mocked(getOwnGarmentTypes)

const resumen = { activos: 1, historial: 2, pedidos_con_saldo: 1, saldo_pendiente: 50, total_pagado: 300, total_facturado: 350 }
const activo: OwnOrderSummary = { id: 15, fecha_recibido: '2026-10-30T14:00:00Z', fecha_entrega_estimada: '2026-11-03T14:00:00Z', total: 300, total_pagado: 250, saldo_pendiente: 50, en_proceso: true, cancelado: false, tipos_prenda: ['Camisa', 'Pantalón'], estado_actual: { id: 3, nombre: 'En planchado', orden: 3 } }
const finalizado: OwnOrderSummary = { id: 9, fecha_recibido: '2026-10-01T14:00:00Z', total: 50, total_pagado: 50, saldo_pendiente: 0, en_proceso: false, cancelado: false, tipos_prenda: ['Edredón'], estado_actual: { id: 6, nombre: 'Finalizado', orden: 6, es_terminal: true } }
const cancelado: OwnOrderSummary = { id: 5, fecha_recibido: '2026-09-01T14:00:00Z', total: 20, total_pagado: 0, saldo_pendiente: 20, en_proceso: false, cancelado: true, estado_actual: { id: 7, nombre: 'Cancelado', orden: 7, es_terminal: true, es_cancelacion: true } }

const page = (pedidos: OwnOrderSummary[], total = pedidos.length, extra: Partial<OwnOrdersResponse> = {}): OwnOrdersResponse => ({ pedidos, total, pagina: 1, limite: 8, resumen, ...extra })

function renderAt(path: string) {
  useClientSession.getState().setSession({ customer: { id: 42, nombre: 'Ana', apellido: 'López' }, token: 'jwt' })
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

function serve(handler: (params: OwnOrdersParams) => OwnOrdersResponse) {
  listMock.mockImplementation(async (params = {}) => handler(params))
}

beforeEach(() => {
  listMock.mockReset()
  detailMock.mockReset().mockRejectedValue(new Error('sin detalle'))
  historyMock.mockReset()
  typesMock.mockReset().mockResolvedValue([{ id: 1, nombre: 'Camisa' }, { id: 4, nombre: 'Edredón' }])
})

describe('Mis pedidos: activos e historial', () => {
  it('avisa cuando el cliente aún no tiene pedidos', async () => {
    serve(() => ({ pedidos: [], total: 0, pagina: 1, limite: 8, resumen: { ...resumen, activos: 0, historial: 0 } }))
    renderAt('/mis-pedidos')
    expect(screen.getAllByRole('status')[0]).toHaveTextContent(/Cargando/)
    expect(await screen.findByRole('heading', { name: 'Aún no tienes pedidos.' })).toBeInTheDocument()
  })

  it('muestra primero los activos y luego el historial más reciente, con total y saldo', async () => {
    serve((params) => params.seccion === 'activos' ? page([activo]) : page([finalizado, cancelado]))
    renderAt('/mis-pedidos')
    const activeSection = within(await screen.findByRole('region', { name: /Pedidos activos/ }))
    const ticket = within((await activeSection.findByRole('heading', { name: 'SLV-0015' })).closest('article')!)
    expect(ticket.getByRole('status', { name: 'Estado actual: En planchado' })).toBeInTheDocument()
    expect(ticket.getByText(/Camisa, Pantalón/)).toBeInTheDocument()
    expect(ticket.getByText(/Q\s?300[.,]00/)).toBeInTheDocument()
    expect(ticket.getByText(/Q\s?50[.,]00/)).toBeInTheDocument()

    const historySection = within(screen.getByRole('region', { name: /Historial de pedidos/ }))
    const headings = await historySection.findAllByRole('heading', { name: /SLV-/ })
    expect(headings.map((heading) => heading.textContent)).toEqual(['SLV-0009', 'SLV-0005'])
    expect(within(headings[1].closest('article')!).getByText('—')).toBeInTheDocument()

    const sections = screen.getAllByRole('region').map((region) => region.getAttribute('aria-labelledby'))
    expect(sections.indexOf('pedidos-activos')).toBeLessThan(sections.indexOf('historial-pedidos'))
    expect(screen.getByText(/Q\s?350[.,]00/)).toBeInTheDocument()
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ seccion: 'activos' }), expect.any(AbortSignal))
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ seccion: 'historial', orden: 'recientes', pagina: 1 }), expect.any(AbortSignal))
  })

  it('filtra el historial por fechas y tipo de prenda, avisa sin resultados y limpia filtros', async () => {
    const user = userEvent.setup()
    serve((params) => {
      if (params.seccion === 'activos') return page([])
      if (params.tipo_prenda_id === 1) return page([])
      return page([finalizado])
    })
    renderAt('/mis-pedidos')
    expect(await screen.findByRole('heading', { name: 'No tienes pedidos activos.' })).toBeInTheDocument()
    const filters = within(await screen.findByRole('search', { name: 'Filtrar historial de pedidos' }))
    expect(filters.getByRole('button', { name: 'Limpiar filtros' })).toBeDisabled()

    await user.type(filters.getByLabelText('Desde'), '2026-10-01')
    await user.type(filters.getByLabelText('Hasta'), '2026-10-31')
    await waitFor(() => expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ seccion: 'historial', fecha_desde: '2026-10-01', fecha_hasta: '2026-10-31' }), expect.any(AbortSignal)))
    await user.selectOptions(filters.getByLabelText('Tipo de prenda'), 'Camisa')
    expect(await screen.findByRole('heading', { name: 'No hay pedidos con esos filtros.' })).toBeInTheDocument()
    expect(listMock).toHaveBeenLastCalledWith(expect.objectContaining({ tipo_prenda_id: 1, pagina: 1 }), expect.any(AbortSignal))

    await user.click(filters.getByRole('button', { name: 'Limpiar filtros' }))
    expect(await screen.findByRole('heading', { name: 'SLV-0009' })).toBeInTheDocument()
    expect(filters.getByLabelText('Desde')).toHaveValue('')
    expect(filters.getByLabelText('Tipo de prenda')).toHaveValue('')
  })

  it('pagina el historial cuando hay muchos pedidos', async () => {
    const user = userEvent.setup()
    serve((params) => {
      if (params.seccion === 'activos') return page([activo])
      return params.pagina === 2 ? page([cancelado], 9) : page([finalizado], 9)
    })
    renderAt('/mis-pedidos')
    const pager = within(await screen.findByRole('navigation', { name: 'Páginas del historial de pedidos' }))
    expect(pager.getByText('Página 1 de 2')).toBeInTheDocument()
    await user.click(pager.getByRole('button', { name: 'Siguiente' }))
    expect(await screen.findByRole('heading', { name: 'SLV-0005' })).toBeInTheDocument()
  })

  it('muestra el aviso de historial vacío', async () => {
    serve((params) => params.seccion === 'activos' ? page([activo]) : page([], 0))
    renderAt('/mis-pedidos')
    expect(await screen.findByRole('heading', { name: 'Aún no tienes historial.' })).toBeInTheDocument()
  })

  it('muestra error y permite reintentar los activos', async () => {
    const user = userEvent.setup()
    let fail = true
    serve((params) => {
      if (params.seccion === 'activos' && fail) { fail = false; throw new Error('fallo') }
      return params.seccion === 'activos' ? page([activo]) : page([])
    })
    renderAt('/mis-pedidos')
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus pedidos activos')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByRole('heading', { name: 'SLV-0015' })).toBeInTheDocument()
  })

  it('despliega el detalle del ticket con enlace al pedido completo', async () => {
    const user = userEvent.setup()
    serve((params) => params.seccion === 'activos' ? page([activo]) : page([]))
    renderAt('/mis-pedidos')
    const ticket = within((await screen.findByRole('heading', { name: 'SLV-0015' })).closest('article')!)
    await user.click(ticket.getByRole('button', { name: 'Ver detalle' }))
    expect(ticket.getByRole('link', { name: /Ver pedido completo/ })).toHaveAttribute('href', '/mis-pedidos/15')
  })

  it('muestra prendas, servicios, progreso aplicable e historial del pedido', async () => {
    detailMock.mockReset().mockResolvedValue({
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
    const timeline = screen.getByRole('list', { name: 'Historial de estados' })
    expect(within(timeline).getByText('Listo para rack')).toBeInTheDocument()
  })
})
