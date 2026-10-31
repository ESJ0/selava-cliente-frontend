import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getOwnOrderDetail, getOwnOrderHistory, getOwnOrders } from '../api/orders'
import { getOwnOrderBalance, getOwnOrderPayments } from '../api/payments'
import { AppRoutes } from '../routes/AppRoutes'
import { useClientSession } from '../store/session'

vi.mock('../api/orders', () => ({ getOwnOrders: vi.fn(), getOwnOrderDetail: vi.fn(), getOwnOrderHistory: vi.fn() }))
vi.mock('../api/payments', () => ({ getOwnOrderPayments: vi.fn(), getOwnOrderBalance: vi.fn() }))

const listMock = vi.mocked(getOwnOrders)
const paymentsMock = vi.mocked(getOwnOrderPayments)
const balanceMock = vi.mocked(getOwnOrderBalance)

function renderPayments() {
  useClientSession.getState().setSession({ customer: { id: 42, nombre: 'Ana', apellido: 'López' }, token: 'jwt' })
  return render(<MemoryRouter initialEntries={['/pagos']}><AppRoutes /></MemoryRouter>)
}

beforeEach(() => {
  listMock.mockReset()
  paymentsMock.mockReset()
  balanceMock.mockReset()
  vi.mocked(getOwnOrderDetail).mockReset()
  vi.mocked(getOwnOrderHistory).mockReset()
})

describe('pagos propios del cliente SEL-106', () => {
  it('muestra carga y luego el estado vacio', async () => {
    listMock.mockResolvedValue({ pedidos: [], total: 0, pagina: 1, limite: 20 })
    renderPayments()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando pagos')
    expect(await screen.findByRole('heading', { name: 'Aún no tienes pagos.' })).toBeInTheDocument()
    expect(document.title).toBe('Mis pagos | SeLava')
  })

  it('presenta historial, metodo y saldo por pedido', async () => {
    listMock.mockResolvedValue({
      pedidos: [{ id: 7, fecha_recibido: '2026-10-15T14:00:00Z', total: 100, estado_actual: { id: 2, nombre: 'En proceso', orden: 2 } }],
      total: 1, pagina: 1, limite: 20,
    })
    paymentsMock.mockResolvedValue([{ id: 1, pedido_id: 7, monto: 25, referencia: 'TRX-25', fecha_pago: '2026-10-19T14:00:00Z', metodo_pago: { id: 2, nombre: 'Transferencia' } }])
    balanceMock.mockResolvedValue({ pedido_id: 7, total: 100, total_pagado: 25, saldo_pendiente: 75 })

    renderPayments()
    const cardTitle = await screen.findByRole('heading', { name: 'SLV-0007' })
    const card = cardTitle.closest('article')!
    expect(within(card).getByText('Transferencia')).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'Copiar referencia TRX-25' })).toHaveTextContent('TRX-25')
    expect(within(card).getByText(/Q\s?100[.,]00/)).toBeInTheDocument()
    expect(within(card).getAllByText(/Q\s?25[.,]00/)).toHaveLength(2)
    expect(within(card).getByText(/Q\s?75[.,]00/)).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: 'Ver detalle de SLV-0007' })).toHaveAttribute('href', '/mis-pedidos/7')
    expect(paymentsMock).toHaveBeenCalledWith(7, expect.any(AbortSignal))
    expect(balanceMock).toHaveBeenCalledWith(7, expect.any(AbortSignal))
  })

  it('mantiene el saldo visible cuando el pedido aun no tiene pagos', async () => {
    listMock.mockResolvedValue({
      pedidos: [{ id: 8, fecha_recibido: '2026-10-18T14:00:00Z', total: 40, estado_actual: { id: 1, nombre: 'Recibido', orden: 1 } }],
      total: 1, pagina: 1, limite: 20,
    })
    paymentsMock.mockResolvedValue([])
    balanceMock.mockResolvedValue({ pedido_id: 8, total: 40, total_pagado: 0, saldo_pendiente: 40 })
    renderPayments()

    expect(await screen.findByText('Aún no hay pagos registrados para este pedido.')).toBeInTheDocument()
    const card = within(screen.getByRole('heading', { name: 'SLV-0008' }).closest('article')!)
    expect(card.getAllByText(/Q\s?40[.,]00/)).toHaveLength(2)
  })

  it('muestra error y permite reintentar', async () => {
    const user = userEvent.setup()
    listMock.mockRejectedValueOnce(new Error('fallo')).mockResolvedValueOnce({ pedidos: [], total: 0, pagina: 1, limite: 20 })
    renderPayments()
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus pagos')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByRole('heading', { name: 'Aún no tienes pagos.' })).toBeInTheDocument()
    expect(listMock).toHaveBeenCalledTimes(2)
  })

  it('separa los pedidos con saldo de los liquidados', async () => {
    const user = userEvent.setup()
    listMock.mockResolvedValue({
      pedidos: [
        { id: 7, fecha_recibido: '2026-10-15T14:00:00Z', total: 100, estado_actual: { id: 2, nombre: 'En proceso', orden: 2 } },
        { id: 8, fecha_recibido: '2026-10-16T14:00:00Z', total: 40, estado_actual: { id: 5, nombre: 'Entregado', orden: 5 } },
      ],
      total: 2, pagina: 1, limite: 20,
    })
    paymentsMock.mockResolvedValue([])
    balanceMock.mockImplementation(async (id: number) => id === 7
      ? { pedido_id: 7, total: 100, total_pagado: 25, saldo_pendiente: 75 }
      : { pedido_id: 8, total: 40, total_pagado: 40, saldo_pendiente: 0 })
    renderPayments()
    expect(await screen.findByText('Corresponde a 1 pedido con saldo.')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Liquidados/ }))
    expect(screen.getByRole('heading', { name: 'SLV-0008' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'SLV-0007' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Con saldo/ }))
    expect(screen.getByRole('heading', { name: 'SLV-0007' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'SLV-0008' })).not.toBeInTheDocument()
  })
})
