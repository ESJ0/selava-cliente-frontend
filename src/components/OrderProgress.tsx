import type { CSSProperties } from 'react'
import type { OrderFlowStage, OrderStatus, OwnOrderFlow } from '../types/order'
import { orderStageIcon, orderStageKey } from '../utils/orderStage'

function stageStatus(stage: OrderFlowStage) {
  if (stage.actual) return { className: 'current', label: 'Estado actual' }
  if (stage.completado) return { className: 'completed', label: 'Completado' }
  return { className: 'pending', label: 'Pendiente' }
}

export function OrderProgress({ flow, currentStatus }: { flow: OwnOrderFlow; currentStatus?: OrderStatus }) {
  const stages = [...flow.estados].sort((a, b) => a.orden - b.orden)
  const progress = Math.min(100, Math.max(0, flow.progreso_porcentaje))

  if (stages.length === 0) {
    if (currentStatus) {
      const Icon = orderStageIcon(currentStatus)
      return (
        <div className="order-progress-legacy" role="status" aria-label={`Estado actual del pedido histórico: ${currentStatus.nombre}`}>
          <span><Icon size={20} aria-hidden="true" /></span>
          <div><strong>{currentStatus.nombre}</strong><p>Este pedido anterior no cuenta con el desglose completo de etapas.</p></div>
        </div>
      )
    }
    return <p className="muted-copy">No hay etapas de seguimiento disponibles para este pedido.</p>
  }

  return (
    <div className={`order-progress${flow.cancelado ? ' cancelled' : ''}`}>
      <div className="order-progress-summary">
        <span>{flow.cancelado ? 'Pedido cancelado' : 'Progreso del pedido'}</span>
        <strong>{progress}%</strong>
      </div>
      <div
        className="order-progress-bar"
        role="progressbar"
        aria-label="Progreso completado del pedido"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <ol
        className="order-progress-stages"
        aria-label="Progreso del pedido"
        style={{ '--stage-count': stages.length } as CSSProperties}
      >
        {stages.map((stage, index) => {
          const key = orderStageKey(stage)
          const Icon = orderStageIcon(stage)
          const status = stageStatus(stage)
          const nextStage = stages[index + 1]
          const connectorCompleted = nextStage?.completado || nextStage?.actual
          return (
            <li
              key={stage.id}
              className={`order-progress-stage ${status.className}${connectorCompleted ? ' connector-completed' : ''}`}
              aria-current={stage.actual ? 'step' : undefined}
              data-stage-code={key}
            >
              <span className="order-progress-icon"><Icon size={21} strokeWidth={2.2} aria-hidden="true" /></span>
              <div className="order-progress-stage-copy">
                <strong>{stage.nombre}</strong>
                <span className="order-progress-status">{status.label}</span>
                {stage.servicios.length > 0 && <small>Servicios: {stage.servicios.map((service) => service.nombre).join(', ')}</small>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
