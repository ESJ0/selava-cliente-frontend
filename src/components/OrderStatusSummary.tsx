import type { OrderStatus } from '../types/order'
import { orderStageIcon, orderStageKey } from '../utils/orderStage'

export function OrderStatusSummary({ status }: { status: OrderStatus }) {
  const Icon = orderStageIcon(status)
  const key = orderStageKey(status).toLowerCase().replaceAll('_', '-')

  return (
    <span className={`order-state-summary state-${key}`} role="status" aria-label={`Estado actual: ${status.nombre}`}>
      <span className="order-state-summary-icon"><Icon size={18} strokeWidth={2.2} aria-hidden="true" /></span>
      <span className="order-state-summary-copy">
        <small>Estado actual</small>
        <strong>{status.nombre}</strong>
      </span>
    </span>
  )
}
