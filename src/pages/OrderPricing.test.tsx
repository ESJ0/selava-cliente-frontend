import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import { getOwnOrderDetail } from '../api/orders'
import { OrderDetailPage } from './OrderDetailPage'

vi.mock('../api/orders', () => ({ getOwnOrderDetail: vi.fn(), getOwnOrderHistory: vi.fn().mockResolvedValue([]) }))

it.each([true, false])('presenta el importe congelado con precio de prenda=%s y conserva el histórico', async (newPricing) => {
  vi.mocked(getOwnOrderDetail).mockResolvedValue({
    id: 7, fecha_recibido: '2026-10-19T10:00:00Z', total: 50, estado_actual: { id: 1, nombre: 'Recibido', orden: 1 },
    prendas: [{ id: 1, tipo_prenda_id: 2, tipo_prenda: { id: 2, nombre: 'Camisa' }, cantidad: 2, precio_aplicado: newPricing ? 25 : null, servicios: [{ id: 3, servicio_id: 4, precio_aplicado: newPricing ? 0 : 25, servicio: { id: 4, nombre: 'Lavado', precio_base: 999 } }] }],
  })
  render(<MemoryRouter initialEntries={['/mis-pedidos/7']}><Routes><Route path="/mis-pedidos/:pedidoID" element={<OrderDetailPage />} /></Routes></MemoryRouter>)
  const card = (await screen.findByRole('heading', { name: 'Camisa' })).closest('article')!
  expect(within(card).getByText('Lavado')).toBeInTheDocument()
  expect(within(card).queryByText(/999[.,]00/)).not.toBeInTheDocument()
  expect(within(card).queryByText(/Q\s*0[.,]00/)).not.toBeInTheDocument()
  if (newPricing) expect(within(card).getByText(/50[.,]00/)).toBeInTheDocument()
  else expect(within(card).getByText(/25[.,]00/)).toBeInTheDocument()
})
