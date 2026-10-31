import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { getOwnOrderDetail, getOwnOrderHistory } from '../api/orders'
import { OrderDetailPage } from './OrderDetailPage'

vi.mock('../api/orders', () => ({ getOwnOrderDetail: vi.fn(), getOwnOrderHistory: vi.fn().mockResolvedValue([]) }))

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getOwnOrderHistory).mockResolvedValue([])
})

function renderDetail() {
  return render(<MemoryRouter initialEntries={['/mis-pedidos/7']}><Routes><Route path="/mis-pedidos/:pedidoID" element={<OrderDetailPage />} /></Routes></MemoryRouter>)
}

const baseFlow = { estados: [], progreso_porcentaje: 0, cancelado: false }
const baseOrder = { id: 7, fecha_recibido: '2026-10-19T10:00:00Z', total: 199.99, estado_actual: { id: 1, nombre: 'Recibido', orden: 1 }, flujo_operativo: baseFlow }

it.each([true, false])('presenta el importe congelado con precio de prenda=%s y conserva el histórico', async (newPricing) => {
  vi.mocked(getOwnOrderDetail).mockResolvedValue({
    ...baseOrder, total: 50,
    prendas: [{ id: 1, tipo_prenda_id: 2, tipo_prenda: { id: 2, nombre: 'Camisa' }, cantidad: 2, subtotal: 50, precio_aplicado: newPricing ? 25 : null, servicios: [{ id: 3, servicio_id: 4, precio_aplicado: newPricing ? 0 : 25, servicio: { id: 4, nombre: 'Lavado', precio_base: 999 } }] }],
  })
  render(<MemoryRouter initialEntries={['/mis-pedidos/7']}><Routes><Route path="/mis-pedidos/:pedidoID" element={<OrderDetailPage />} /></Routes></MemoryRouter>)
  const card = (await screen.findByRole('heading', { name: 'Camisa' })).closest('article')!
  expect(within(card).getByText('Lavado')).toBeInTheDocument()
  expect(within(card).queryByText(/999[.,]00/)).not.toBeInTheDocument()
  expect(within(card).queryByText(/Q\s*0[.,]00/)).not.toBeInTheDocument()
  if (newPricing) expect(within(card).getByText(/50[.,]00/)).toBeInTheDocument()
  else expect(within(card).getByText(/25[.,]00/)).toBeInTheDocument()
})

it.each([
  ['UNIDAD', 3, 25, 75, '3 unidades', /Q\s*25\.00 por unidad/, /Q\s*75\.00/],
  ['LIBRA', 2.5, 12, 30, '2.5 lb', /Q\s*12\.00 por libra/, /Q\s*30\.00/],
  ['METRO', 1.25, 18, 22.5, '1.25 m', /Q\s*18\.00 por metro/, /Q\s*22\.50/],
] as const)('presenta medida, precio y subtotal del servidor en %s', async (mode, amount, price, subtotal, measureText, rate, expectedSubtotal) => {
  vi.mocked(getOwnOrderDetail).mockResolvedValue({ ...baseOrder, prendas: [{ id: 1, tipo_prenda_id: 2, tipo_prenda: { id: 2, nombre: 'Prenda', precio: 999, modalidad_cobro: 'METRO' }, cantidad: amount, modalidad_cobro_aplicada: mode, precio_aplicado: price, subtotal, servicios: [{ id: 3, servicio_id: 4, precio_aplicado: 0, servicio: { id: 4, nombre: 'Lavado', precio_base: 999 } }, { id: 5, servicio_id: 6, precio_aplicado: 0 }] }] })
  renderDetail()
  const card = (await screen.findByRole('heading', { name: 'Prenda' })).closest('article')!
  expect(within(card).getByText(measureText)).toBeInTheDocument()
  expect(within(card).getByText('Precio aplicado').nextElementSibling).toHaveTextContent(rate)
  expect(within(card).getByText(expectedSubtotal)).toBeInTheDocument()
  expect(within(card).queryByText(/999\.00|Q\s*0\.00/)).not.toBeInTheDocument()
  expect(screen.getAllByText(/Q\s*199\.99/).length).toBeGreaterThan(0)
})

it('presenta el subtotal recibido sin multiplicar ni sumar los servicios', async () => {
  vi.mocked(getOwnOrderDetail).mockResolvedValue({ ...baseOrder, prendas: [{ id: 1, tipo_prenda_id: 2, cantidad: 0.5, modalidad_cobro_aplicada: 'LIBRA', precio_aplicado: 1.23, subtotal: 42.37, servicios: [] }] })
  renderDetail()
  expect((await screen.findAllByText(/Q\s*42\.37/)).length).toBeGreaterThan(0)
  expect(screen.queryByText(/Q\s*0\.62/)).not.toBeInTheDocument()
  expect(screen.getAllByText(/Q\s*199\.99/).length).toBeGreaterThan(0)
})

it.each([undefined, null])('conserva unidades cuando no hay modalidad histórica (%s)', async mode => {
  vi.mocked(getOwnOrderDetail).mockResolvedValue({ ...baseOrder, prendas: [{ id: 1, tipo_prenda_id: 2, tipo_prenda: { id: 2, nombre: 'Histórica', precio: 999, modalidad_cobro: 'LIBRA' }, cantidad: 3, modalidad_cobro_aplicada: mode, precio_aplicado: 25, subtotal: 75, servicios: [] }] })
  renderDetail()
  expect(await screen.findByText('3 unidades')).toBeInTheDocument()
  expect(screen.getByText('Precio aplicado').nextElementSibling).toHaveTextContent(/Q\s*25\.00 por unidad/)
  expect(screen.queryByText(/3 lb|por libra|999\.00/)).not.toBeInTheDocument()
})

it('no inventa un subtotal si un servidor anterior no lo devuelve', async () => {
  vi.mocked(getOwnOrderDetail).mockResolvedValue({ ...baseOrder, prendas: [{ id: 1, tipo_prenda_id: 2, cantidad: 2, precio_aplicado: 25, servicios: [] }] })
  renderDetail()
  expect(await screen.findByText('No disponible')).toBeInTheDocument()
  expect(screen.queryByText(/Q\s*50\.00/)).not.toBeInTheDocument()
})

it('presenta el estado sin prendas', async () => {
  vi.mocked(getOwnOrderDetail).mockResolvedValue({ ...baseOrder, prendas: [] })
  renderDetail()
  expect(await screen.findByText('Este pedido no tiene prendas registradas.')).toBeInTheDocument()
})

it('mantiene carga, detalle inexistente y reintento', async () => {
  const user = userEvent.setup()
  vi.mocked(getOwnOrderDetail).mockResolvedValueOnce(null as never).mockResolvedValueOnce({ ...baseOrder, prendas: [] })
  renderDetail()
  expect(screen.getByRole('status')).toHaveTextContent('Cargando detalle')
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar este pedido')
  await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
  expect(await screen.findByText('Este pedido no tiene prendas registradas.')).toBeInTheDocument()
})

it('muestra error de red sin importes anteriores', async () => {
  vi.mocked(getOwnOrderDetail).mockRejectedValue(new Error('network'))
  renderDetail()
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar este pedido')
  expect(screen.queryByText(/Q\s*199\.99/)).not.toBeInTheDocument()
})
