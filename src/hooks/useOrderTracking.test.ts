import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getOwnOrderDetail, getOwnOrderHistory } from '../api/orders'
import type { OwnOrderDetail } from '../types/order'
import { ORDER_TRACKING_POLL_INTERVAL_MS, useOrderTracking } from './useOrderTracking'

vi.mock('../api/orders', () => ({ getOwnOrderDetail: vi.fn(), getOwnOrderHistory: vi.fn() }))

const detailMock = vi.mocked(getOwnOrderDetail)
const historyMock = vi.mocked(getOwnOrderHistory)

function detail(status: string, terminal = false): OwnOrderDetail {
  return {
    id: 7,
    fecha_recibido: '2026-10-27T08:00:00Z',
    total: 50,
    prendas: [],
    estado_actual: { id: terminal ? 6 : 2, nombre: status, orden: terminal ? 60 : 20, es_terminal: terminal },
    flujo_operativo: { estados: [], progreso_porcentaje: terminal ? 100 : 25, cancelado: false },
  }
}

describe('useOrderTracking', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.clearAllMocks()
    historyMock.mockResolvedValue([])
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('consulta al entrar, al recuperar foco y en el intervalo configurado', async () => {
    detailMock
      .mockResolvedValueOnce(detail('Recibido'))
      .mockResolvedValueOnce(detail('En lavado'))
      .mockResolvedValueOnce(detail('Rackeado'))
    const { result } = renderHook(() => useOrderTracking(7))

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(detailMock).toHaveBeenCalledTimes(1)

    act(() => window.dispatchEvent(new Event('focus')))
    await waitFor(() => expect(detailMock).toHaveBeenCalledTimes(2))
    expect(result.current.detail?.estado_actual.nombre).toBe('En lavado')

    act(() => vi.advanceTimersByTime(ORDER_TRACKING_POLL_INTERVAL_MS))
    await waitFor(() => expect(detailMock).toHaveBeenCalledTimes(3))
    expect(result.current.detail?.estado_actual.nombre).toBe('Rackeado')
  })

  it('detiene las consultas periódicas cuando el pedido llega a un estado terminal', async () => {
    detailMock.mockResolvedValue(detail('Finalizado', true))
    const { result } = renderHook(() => useOrderTracking(7))

    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => vi.advanceTimersByTime(ORDER_TRACKING_POLL_INTERVAL_MS * 2))
    expect(detailMock).toHaveBeenCalledTimes(1)
  })

  it('conserva los datos ante un error de actualización y permite reintentar', async () => {
    detailMock
      .mockResolvedValueOnce(detail('Recibido'))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(detail('En lavado'))
    const { result } = renderHook(() => useOrderTracking(7))

    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => vi.advanceTimersByTime(ORDER_TRACKING_POLL_INTERVAL_MS))
    await waitFor(() => expect(result.current.refreshError).toBe(true))
    expect(result.current.detail?.estado_actual.nombre).toBe('Recibido')

    act(() => result.current.refresh())
    await waitFor(() => expect(result.current.detail?.estado_actual.nombre).toBe('En lavado'))
    expect(result.current.refreshError).toBe(false)
  })

  it('presenta error inicial y vuelve a cargar mediante retry', async () => {
    detailMock.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(detail('Recibido'))
    const { result } = renderHook(() => useOrderTracking(7))

    await waitFor(() => expect(result.current.status).toBe('error'))
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.detail?.estado_actual.nombre).toBe('Recibido')
  })
})
