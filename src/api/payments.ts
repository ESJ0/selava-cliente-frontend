import type { OrderBalance, OwnPayment } from '../types/payment'
import { authenticatedApi } from './client'

export async function getOwnOrderPayments(orderId: number, signal?: AbortSignal): Promise<OwnPayment[]> {
  const { data } = await authenticatedApi.get<OwnPayment[]>(`/cliente/pedidos/${orderId}/pagos`, { signal })
  return data
}

export async function getOwnOrderBalance(orderId: number, signal?: AbortSignal): Promise<OrderBalance> {
  const { data } = await authenticatedApi.get<OrderBalance>(`/cliente/pedidos/${orderId}/saldo`, { signal })
  return data
}
