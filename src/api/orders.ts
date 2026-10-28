import type { OwnOrderDetail, OwnOrderFlow, OwnOrderHistoryEntry, OwnOrdersParams, OwnOrdersResponse } from '../types/order'
import { authenticatedApi } from './client'

type OwnOrderDetailPayload = Omit<OwnOrderDetail, 'flujo_operativo'> & {
  flujo_operativo?: Partial<OwnOrderFlow>
}

export async function getOwnOrders(params: OwnOrdersParams = {}, signal?: AbortSignal): Promise<OwnOrdersResponse> {
  const { data } = await authenticatedApi.get<OwnOrdersResponse>('/cliente/pedidos', { params, signal })
  return data
}

export async function getOwnOrderDetail(orderId: number, signal?: AbortSignal): Promise<OwnOrderDetail> {
  const { data } = await authenticatedApi.get<OwnOrderDetailPayload>(`/cliente/pedidos/${orderId}`, { signal })
  const rawFlow = data.flujo_operativo
  return {
    ...data,
    flujo_operativo: {
      estados: [...(rawFlow?.estados ?? [])].sort((a, b) => a.orden - b.orden),
      siguiente_estado: rawFlow?.siguiente_estado,
      progreso_porcentaje: rawFlow?.progreso_porcentaje ?? 0,
      cancelado: rawFlow?.cancelado ?? data.estado_actual.es_cancelacion ?? data.estado_actual.nombre.trim().toLocaleLowerCase('es') === 'cancelado',
    },
  }
}

export async function getOwnOrderHistory(orderId: number, signal?: AbortSignal): Promise<OwnOrderHistoryEntry[]> {
  const { data } = await authenticatedApi.get<OwnOrderHistoryEntry[] | null>(`/cliente/pedidos/${orderId}/historial-estados`, { signal })
  return data ?? []
}
