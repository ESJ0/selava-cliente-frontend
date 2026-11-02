import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getOwnGarmentTypes, getOwnOrderDetail, getOwnOrderHistory, getOwnOrders } from '../api/orders'
import { getOwnOrderBalance, getOwnOrderPayments } from '../api/payments'
import { AppRoutes } from '../routes/AppRoutes'
import { useClientSession } from '../store/session'
import type { OwnOrderSummary, OwnOrdersParams, OwnOrdersResponse } from '../types/order'
import { paymentSituation } from '../utils/portal'

vi.mock('../api/orders', () => ({ getOwnOrders: vi.fn(), getOwnOrderDetail: vi.fn(), getOwnOrderHistory: vi.fn(), getOwnGarmentTypes: vi.fn() }))
vi.mock('../api/payments', () => ({ getOwnOrderPayments: vi.fn(), getOwnOrderBalance: vi.fn() }))

const listMock = vi.mocked(getOwnOrders)
const paymentsMock = vi.mocked(getOwnOrderPayments)

const status = (nombre: string, terminal = false, cancel = false) => ({ id: nombre.length, nombre, orden: 1, es_terminal: terminal, es_cancelacion: cancel })
const order = (id: number, total: number, paid: number, inProcess: boolean, extra: Partial<OwnOrderSummary> = {}): OwnOrderSummary => ({
  id, total, total_pagado: paid, saldo_pendiente: Math.max(0, total - paid), en_proceso: inProcess, cancelado: false,
  fecha_recibido: `2026-10-${String(id).padStart(2, '0')}T14:00:00Z`, tipos_prenda: ['Camisa'],
  estado_actual: inProcess ? status('En proceso') : status('Finalizado', true), ...extra,
})
const activeDue = order(7, 100, 25, true)
const activePaid = order(8, 40, 40, true)
const finishedDue = order(5, 80, 30, false)
const finishedPaid = order(3, 60, 60, false)
const resumen = { activos: 2, historial: 2, pedidos_con_saldo: 2, saldo_pendiente: 125, total_pagado: 155, total_facturado: 280 }
const page = (pedidos: OwnOrderSummary[], total = pedidos.length): OwnOrdersResponse => ({ pedidos, total, pagina: 1, limite: 8, resumen })

function serve(handler: (params: OwnOrdersParams) => OwnOrdersResponse) {
  listMock.mockImplementation(async (params = {}) => handler(params))
}

function renderPayments() {
  useClientSession.getState().setSession({ customer: { id: 42, nombre: 'Ana', apellido: 'López' }, token: 'jwt' })
  return render(<MemoryRouter initialEntries={['/pagos']}><AppRoutes /></MemoryRouter>)
}

beforeEach(() => {
  listMock.mockReset()
  paymentsMock.mockReset().mockResolvedValue([])
  vi.mocked(getOwnOrderBalance).mockReset()
  vi.mocked(getOwnOrderDetail).mockReset()
  vi.mocked(getOwnOrderHistory).mockReset()
  vi.mocked(getOwnGarmentTypes).mockReset().mockResolvedValue([{ id: 1, nombre: 'Camisa' }, { id: 2, nombre: 'Vestido' }])
})

describe('clasificación de pagos', () => {
  it.each([
    [activeDue, 'activo-saldo'],
    [activePaid, 'activo-pagado'],
    [finishedDue, 'finalizado-saldo'],
    [finishedPaid, 'finalizado-pagado'],
    [order(9, 30, 0, false, { cancelado: true, estado_actual: status('Cancelado', true, true) }), 'cancelado'],
  ])('clasifica el pedido %#', (item, expected) => {
    expect(paymentSituation(item)).toBe(expected)
  })
})

describe('Mis pagos: pendientes e historial', () => {
  it('muestra carga y luego el estado vacío', async () => {
    serve(() => ({ pedidos: [], total: 0, pagina: 1, limite: 100, resumen: { ...resumen, activos: 0, historial: 0, pedidos_con_saldo: 0, saldo_pendiente: 0, total_pagado: 0, total_facturado: 0 } }))
    renderPayments()
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('Cargando pagos')
    expect(await screen.findByRole('heading', { name: 'Aún no tienes pagos.' })).toBeInTheDocument()
    expect(document.title).toBe('Mis pagos | SELAVA')
  })

  it('prioriza los pendientes activos y mueve los pagados al historial', async () => {
    serve((params) => params.saldo === 'pendiente' ? page([activeDue, finishedDue]) : page([activePaid, finishedPaid]))
    renderPayments()
    const pending = within(await screen.findByRole('region', { name: /Pagos pendientes/ }))
    const pendingCodes = (await pending.findAllByRole('heading', { name: /SLV-/ })).map((heading) => heading.textContent)
    expect(pendingCodes).toEqual(['SLV-0007', 'SLV-0005'])
    const first = within(pending.getByRole('heading', { name: 'SLV-0007' }).closest('article')!)
    expect(first.getByText('En proceso · saldo pendiente')).toBeInTheDocument()
    expect(first.getByText(/Q\s?100[.,]00/)).toBeInTheDocument()
    expect(first.getByText(/Q\s?25[.,]00/)).toBeInTheDocument()
    expect(first.getByText(/Q\s?75[.,]00/)).toBeInTheDocument()
    expect(first.getByRole('link', { name: 'Ver detalle de SLV-0007' })).toHaveAttribute('href', '/mis-pedidos/7')
    expect(within(pending.getByRole('heading', { name: 'SLV-0005' }).closest('article')!).getByText('Finalizado · saldo pendiente')).toBeInTheDocument()

    const history = within(screen.getByRole('region', { name: /Historial de pagos/ }))
    expect(within((await history.findByRole('heading', { name: 'SLV-0008' })).closest('article')!).getByText('En proceso · pagado')).toBeInTheDocument()
    expect(within(history.getByRole('heading', { name: 'SLV-0003' }).closest('article')!).getByText('Finalizado · pagado')).toBeInTheDocument()

    expect(screen.getByText('Repartido en 2 pedidos con saldo.')).toBeInTheDocument()
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ saldo: 'pendiente', orden: 'prioridad' }), expect.any(AbortSignal))
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ saldo: 'pagado', orden: 'recientes', pagina: 1 }), expect.any(AbortSignal))
    expect(paymentsMock).not.toHaveBeenCalled()
  })

  it('carga los abonos de un pedido al abrirlo', async () => {
    const user = userEvent.setup()
    serve((params) => params.saldo === 'pendiente' ? page([activeDue]) : page([]))
    paymentsMock.mockResolvedValue([{ id: 1, pedido_id: 7, monto: 25, referencia: 'TRX-25', fecha_pago: '2026-10-19T14:00:00Z', metodo_pago: { id: 2, nombre: 'Transferencia' } }])
    renderPayments()
    const card = within((await screen.findByRole('heading', { name: 'SLV-0007' })).closest('article')!)
    await user.click(card.getByRole('button', { name: 'Ver abonos' }))
    expect(await card.findByText('Transferencia')).toBeInTheDocument()
    expect(card.getByRole('button', { name: 'Copiar referencia TRX-25' })).toHaveTextContent('TRX-25')
    expect(paymentsMock).toHaveBeenCalledWith(7, expect.any(AbortSignal))
  })

  it('avisa cuando no hay pagos pendientes ni historial', async () => {
    serve(() => page([]))
    renderPayments()
    expect(await screen.findByRole('heading', { name: 'No tienes pagos pendientes.' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Aún no tienes historial de pagos.' })).toBeInTheDocument()
  })

  it('filtra el historial por fecha, prenda y estado, y limpia filtros', async () => {
    const user = userEvent.setup()
    serve((params) => {
      if (params.saldo === 'pendiente') return page([])
      if (params.tipo_prenda_id === 2) return page([])
      if (params.seccion === 'historial') return page([finishedPaid])
      return page([activePaid, finishedPaid])
    })
    renderPayments()
    const filters = within(await screen.findByRole('search', { name: 'Filtrar historial de pagos' }))
    await user.selectOptions(filters.getByLabelText('Estado del pedido'), 'Pagado · finalizado')
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'SLV-0008' })).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'SLV-0003' })).toBeInTheDocument()
    expect(listMock).toHaveBeenLastCalledWith(expect.objectContaining({ saldo: 'pagado', seccion: 'historial' }), expect.any(AbortSignal))

    await user.type(filters.getByLabelText('Desde'), '2026-10-01')
    await user.selectOptions(filters.getByLabelText('Tipo de prenda'), 'Vestido')
    expect(await screen.findByRole('heading', { name: 'No hay pagos con esos filtros.' })).toBeInTheDocument()
    expect(listMock).toHaveBeenLastCalledWith(expect.objectContaining({ fecha_desde: '2026-10-01', tipo_prenda_id: 2 }), expect.any(AbortSignal))

    await user.click(screen.getAllByRole('button', { name: 'Limpiar filtros' })[0])
    expect(await screen.findByRole('heading', { name: 'SLV-0008' })).toBeInTheDocument()
  })

  it('no consulta con un rango de fechas invertido', async () => {
    const user = userEvent.setup()
    serve((params) => params.saldo === 'pendiente' ? page([activeDue]) : page([finishedPaid]))
    renderPayments()
    const filters = within(await screen.findByRole('search', { name: 'Filtrar historial de pagos' }))
    await user.type(filters.getByLabelText('Hasta'), '2026-10-01')
    const calls = listMock.mock.calls.length
    await user.type(filters.getByLabelText('Desde'), '2026-10-20')
    expect(await filters.findByRole('alert')).toHaveTextContent('no puede ser posterior')
    expect(listMock.mock.calls.length).toBe(calls)
  })

  it('muestra error y permite reintentar', async () => {
    const user = userEvent.setup()
    let fail = true
    serve((params) => {
      if (params.saldo === 'pendiente' && fail) { fail = false; throw new Error('fallo') }
      return page([])
    })
    renderPayments()
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus pagos')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByRole('heading', { name: 'No tienes pagos pendientes.' })).toBeInTheDocument()
  })
})
