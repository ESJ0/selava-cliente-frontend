import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { getOwnOrderDetail, getOwnOrderHistory } from '../api/orders'
import { OrderDetailPage } from './OrderDetailPage'
import type { AppliedPromotion } from '../types/promotion'

vi.mock('../api/orders', () => ({ getOwnOrderDetail: vi.fn(), getOwnOrderHistory: vi.fn() }))
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getOwnOrderHistory).mockResolvedValue([]) })
const applied: AppliedPromotion = { promocion_id: 8, nombre: 'Paquete histórico', tipo_prenda_id: 2, tipo_prenda_nombre: 'Tipo histórico', modalidad_cobro_aplicada: 'UNIDAD', medida_requerida: 2, precio_promocional: 40, aplicaciones: 2, medida_cubierta: 4, sobrante: 1, precio_normal_aplicado: 25, subtotal_promocional: 80, subtotal_normal: 25, subtotal_total: 105, prenda_ids: [1] }
const order = { id: 7, fecha_recibido: '2026-10-19T10:00:00Z', total: 105, estado_actual: { id: 1, nombre: 'Recibido', orden: 1 }, prendas: [{ id: 1, tipo_prenda_id: 2, tipo_prenda: { id: 2, nombre: 'Nombre actual', precio: 999, modalidad_cobro: 'METRO' }, cantidad: 5, precio_aplicado: 25, servicios: [{ id: 3, servicio_id: 4, precio_aplicado: 0 }] }] }
function renderDetail() { return render(<MemoryRouter initialEntries={['/mis-pedidos/7']}><Routes><Route path="/mis-pedidos/:pedidoID" element={<OrderDetailPage />} /></Routes></MemoryRouter>) }
it.each([['UNIDAD', 4, 1, '4 unidades', '1 unidad'], ['LIBRA', 10, 2.5, '10 lb', '2.5 lb'], ['METRO', 4, 1.5, '4 m', '1.5 m']] as const)('muestra la instantánea %s con sus importes sin reconstruir el catálogo', async (mode, covered, remainder, expectedCovered, expectedRemainder) => {
  vi.mocked(getOwnOrderDetail).mockResolvedValue({ ...order, promociones_aplicadas: [{ ...applied, modalidad_cobro_aplicada: mode, medida_cubierta: covered, sobrante: remainder }] })
  renderDetail()
  const section = within(await screen.findByRole('region', { name: 'Promociones aplicadas' }))
  expect(section.getByText('Paquete histórico')).toBeInTheDocument()
  expect(section.getByText(expectedCovered)).toBeInTheDocument()
  expect(section.getByText(new RegExp(expectedRemainder+' ×'))).toBeInTheDocument()
  expect(section.getByText(/Q\s*80\.00/)).toBeInTheDocument(); expect(section.getByText(/Q\s*105\.00/)).toBeInTheDocument()
  expect(screen.queryByText(/999\.00|125\.00/)).not.toBeInTheDocument()
  expect(screen.getByText('Importe incluido en el desglose de promociones.')).toBeInTheDocument()
})
it('presenta el subtotal persistido aunque no coincida con una reconstrucción local', async () => {
  vi.mocked(getOwnOrderDetail).mockResolvedValue({ ...order, promociones_aplicadas: [{ ...applied, subtotal_total: 42.37 }] })
  renderDetail(); expect(await screen.findByText(/Q\s*42\.37/)).toBeInTheDocument(); expect(screen.getByText(/Q\s*105\.00/)).toBeInTheDocument()
})
it('conserva el detalle de un pedido sin promociones', async () => {
  vi.mocked(getOwnOrderDetail).mockResolvedValue({ ...order, promociones_aplicadas: [] })
  renderDetail(); await screen.findByText('Nombre actual'); expect(screen.queryByRole('region', { name: 'Promociones aplicadas' })).not.toBeInTheDocument(); expect(screen.getByText(/125\.00/)).toBeInTheDocument()
})
it('mantiene carga y error sin mostrar un desglose inexistente', async () => {
  vi.mocked(getOwnOrderDetail).mockRejectedValue(new Error('network'))
  renderDetail(); expect(screen.getByRole('status')).toHaveTextContent('Cargando'); await screen.findByRole('alert'); expect(screen.queryByRole('region', { name: 'Promociones aplicadas' })).not.toBeInTheDocument()
})
