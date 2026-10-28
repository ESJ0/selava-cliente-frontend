import type { OwnOrderDetail, OwnOrderHistoryEntry, OwnOrdersParams, OwnOrdersResponse } from '../types/order'
import { authenticatedApi } from './client'

export async function getOwnOrders(params: OwnOrdersParams = {}, signal?: AbortSignal): Promise<OwnOrdersResponse> {
  const { data } = await authenticatedApi.get<OwnOrdersResponse>('/cliente/pedidos', { params, signal })
  return data
}

export async function getOwnOrderDetail(orderId: number, signal?: AbortSignal): Promise<OwnOrderDetail> {
  const { data } = await authenticatedApi.get<OwnOrderDetail>(`/cliente/pedidos/${orderId}`, { signal })
  return {
    ...data,
    flujo_operativo: {
      ...data.flujo_operativo,
      estados: [...data.flujo_operativo.estados].sort((a, b) => a.orden - b.orden),
    },
  }
}

export async function getOwnOrderHistory(orderId: number, signal?: AbortSignal): Promise<OwnOrderHistoryEntry[]> {
  const { data } = await authenticatedApi.get<OwnOrderHistoryEntry[]>(`/cliente/pedidos/${orderId}/historial-estados`, { signal })
  return data
}
