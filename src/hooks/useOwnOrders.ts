import { useCallback, useEffect, useState } from 'react'
import { getOwnGarmentTypes, getOwnOrders } from '../api/orders'
import type { GarmentTypeOption, OwnOrdersParams, OwnOrdersResponse } from '../types/order'

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

const isCancel = (error: unknown) => {
  const name = (error as { name?: string } | null)?.name
  return name === 'CanceledError' || name === 'AbortError'
}

/**
 * Consulta /cliente/pedidos con filtros del servidor. Con `params = null` no consulta (p. ej. filtros inválidos).
 * Conserva la última respuesta mientras recarga para evitar parpadeos al cambiar de página o filtro.
 */
export function useOwnOrders(params: OwnOrdersParams | null) {
  const [data, setData] = useState<OwnOrdersResponse | null>(null)
  const [status, setStatus] = useState<LoadStatus>(params ? 'loading' : 'idle')
  const [reloadKey, setReloadKey] = useState(0)
  const key = params ? JSON.stringify(params) : ''
  const retry = useCallback(() => setReloadKey((value) => value + 1), [])

  useEffect(() => {
    if (!key) { setStatus('idle'); return }
    const controller = new AbortController()
    setStatus('loading')
    getOwnOrders(JSON.parse(key) as OwnOrdersParams, controller.signal)
      .then((response) => { setData({ ...response, pedidos: response.pedidos ?? [] }); setStatus('ready') })
      .catch((error: unknown) => { if (!controller.signal.aborted && !isCancel(error)) setStatus('error') })
    return () => controller.abort()
  }, [key, reloadKey])

  return { data, status, retry }
}

/** Tipos de prenda de los pedidos del cliente para los filtros; si falla, el filtro queda vacío. */
export function useOwnGarmentTypes() {
  const [types, setTypes] = useState<GarmentTypeOption[]>([])
  useEffect(() => {
    const controller = new AbortController()
    getOwnGarmentTypes(controller.signal).then((items) => { if (!controller.signal.aborted) setTypes(items) }).catch(() => undefined)
    return () => controller.abort()
  }, [])
  return types
}
