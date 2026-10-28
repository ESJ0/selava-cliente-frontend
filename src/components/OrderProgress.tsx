import {
  BadgeCheck,
  Clock3,
  ListChecks,
  PackageCheck,
  Shirt,
  Waves,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import type { OrderFlowStage, OwnOrderFlow } from '../types/order'

const iconsByStage: Record<string, LucideIcon> = {
  RECIBIDO: PackageCheck,
  EN_LAVADO: Waves,
  EN_LAVADO_SECO: Wind,
  EN_LAVADO_EN_SECO: Wind,
  EN_PLANCHADO: Shirt,
  RACKEADO: ListChecks,
  FINALIZADO: BadgeCheck,
}

function stageKey(stage: OrderFlowStage) {
  return (stage.codigo ?? stage.nombre)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function stageStatus(stage: OrderFlowStage) {
  if (stage.actual) return { className: 'current', label: 'Estado actual' }
  if (stage.completado) return { className: 'completed', label: 'Completado' }
  return { className: 'pending', label: 'Pendiente' }
}

export function OrderProgress({ flow }: { flow: OwnOrderFlow }) {
  const stages = [...flow.estados].sort((a, b) => a.orden - b.orden)
  const progress = Math.min(100, Math.max(0, flow.progreso_porcentaje))

  if (stages.length === 0) {
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
          const key = stageKey(stage)
          const Icon = iconsByStage[key] ?? Clock3
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
