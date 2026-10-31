import { useEffect, useState } from 'react'
import { getOwnOrderDetail } from '../api/orders'
import type { OwnOrderDetail } from '../types/order'

/** Consulta el detalle (flujo operativo) de un pedido; devuelve null si no está disponible. */
export async function loadOrderDetail(orderId: number, signal?: AbortSignal): Promise<OwnOrderDetail | null> {
  try { return (await getOwnOrderDetail(orderId, signal)) ?? null } catch { return null }
}

export function useOrderFlow(orderId: number) {
  const [detail, setDetail] = useState<OwnOrderDetail | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    void loadOrderDetail(orderId, controller.signal).then((order) => {
      if (!controller.signal.aborted) setDetail(order)
    })
    return () => controller.abort()
  }, [orderId])
  return detail
}
