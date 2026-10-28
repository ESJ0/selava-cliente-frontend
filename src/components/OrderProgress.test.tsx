import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { OrderFlowStage, OwnOrderFlow } from '../types/order'
import { OrderProgress } from './OrderProgress'

const stages: OrderFlowStage[] = [
  { id: 1, nombre: 'Recibido', codigo: 'RECIBIDO', orden: 10, servicios: [], completado: true, actual: false },
  { id: 2, nombre: 'En lavado', codigo: 'EN_LAVADO', orden: 20, servicios: [{ id: 7, nombre: 'Lavado' }], completado: true, actual: false },
  { id: 3, nombre: 'En lavado en seco', codigo: 'EN_LAVADO_SECO', orden: 30, servicios: [{ id: 8, nombre: 'Lavado en seco' }], completado: true, actual: true },
  { id: 4, nombre: 'En planchado', codigo: 'EN_PLANCHADO', orden: 40, servicios: [{ id: 9, nombre: 'Planchado' }], completado: false, actual: false },
  { id: 5, nombre: 'Rackeado', codigo: 'RACKEADO', orden: 50, servicios: [], completado: false, actual: false },
  { id: 6, nombre: 'Finalizado', codigo: 'FINALIZADO', orden: 60, servicios: [], completado: false, actual: false },
]

const flow: OwnOrderFlow = { estados: stages, progreso_porcentaje: 50, cancelado: false }

function flowAt(code: string, progress: number, applicableStages = stages): OwnOrderFlow {
  const currentOrder = applicableStages.find((stage) => stage.codigo === code)?.orden ?? 0
  return {
    estados: applicableStages.map((stage) => ({
      ...stage,
      completado: stage.orden <= currentOrder,
      actual: stage.codigo === code,
    })),
    progreso_porcentaje: progress,
    cancelado: false,
  }
}

describe('OrderProgress', () => {
  it('representa etapas completadas, actual y pendientes con sus iconos', () => {
    const { container } = render(<OrderProgress flow={flow} />)

    expect(screen.getByRole('progressbar', { name: 'Progreso completado del pedido' })).toHaveAttribute('aria-valuenow', '50')
    const current = container.querySelector('[data-stage-code="EN_LAVADO_SECO"]')
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(within(current as HTMLElement).getByText('Estado actual')).toBeVisible()
    expect(container.querySelector('[data-stage-code="RECIBIDO"]')).toHaveClass('completed')
    expect(container.querySelector('[data-stage-code="EN_PLANCHADO"]')).toHaveClass('pending')

    for (const [code, iconClass] of [
      ['RECIBIDO', 'lucide-package-check'],
      ['EN_LAVADO', 'lucide-waves'],
      ['EN_LAVADO_SECO', 'lucide-wind'],
      ['EN_PLANCHADO', 'lucide-shirt'],
      ['RACKEADO', 'lucide-list-checks'],
      ['FINALIZADO', 'lucide-badge-check'],
    ]) {
      expect(container.querySelector(`[data-stage-code="${code}"] svg`)).toHaveClass(iconClass)
    }
  })

  it('muestra solamente las etapas aplicables recibidas desde la API', () => {
    render(<OrderProgress flow={{ ...flow, estados: [stages[0], stages[1], stages[4], stages[5]] }} />)

    expect(within(screen.getByRole('list', { name: 'Progreso del pedido' })).getAllByRole('listitem')).toHaveLength(4)
    expect(screen.queryByText('En lavado en seco')).not.toBeInTheDocument()
    expect(screen.queryByText('En planchado')).not.toBeInTheDocument()
    expect(screen.getByText('Servicios: Lavado')).toBeVisible()
  })

  it('representa un pedido recién recibido con las etapas posteriores pendientes', () => {
    const applicableStages = [stages[0], stages[1], stages[4], stages[5]]
    const { container } = render(<OrderProgress flow={flowAt('RECIBIDO', 25, applicableStages)} />)

    const current = container.querySelector('[data-stage-code="RECIBIDO"]')
    expect(current).toHaveClass('current')
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(within(current as HTMLElement).getByText('Estado actual')).toBeVisible()
    expect(container.querySelectorAll('.order-progress-stage.pending')).toHaveLength(3)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25')
  })

  it('representa un pedido en proceso con etapas intermedias completadas', () => {
    const { container } = render(<OrderProgress flow={flowAt('EN_PLANCHADO', 67)} />)

    expect(container.querySelector('[data-stage-code="RECIBIDO"]')).toHaveClass('completed')
    expect(container.querySelector('[data-stage-code="EN_LAVADO"]')).toHaveClass('completed')
    expect(container.querySelector('[data-stage-code="EN_LAVADO_SECO"]')).toHaveClass('completed')
    expect(container.querySelector('[data-stage-code="EN_PLANCHADO"]')).toHaveClass('current')
    expect(container.querySelector('[data-stage-code="RACKEADO"]')).toHaveClass('pending')
    expect(container.querySelector('[data-stage-code="FINALIZADO"]')).toHaveClass('pending')
  })

  it('representa un pedido Finalizado con el progreso completo', () => {
    const finalizedStages = flowAt('FINALIZADO', 100).estados.reverse()
    const { container } = render(<OrderProgress flow={{ estados: finalizedStages, progreso_porcentaje: 100, cancelado: false }} />)

    const orderedCodes = within(screen.getByRole('list', { name: 'Progreso del pedido' }))
      .getAllByRole('listitem')
      .map((item) => item.getAttribute('data-stage-code'))
    expect(orderedCodes).toEqual(['RECIBIDO', 'EN_LAVADO', 'EN_LAVADO_SECO', 'EN_PLANCHADO', 'RACKEADO', 'FINALIZADO'])
    expect(container.querySelectorAll('.order-progress-stage.completed')).toHaveLength(5)
    expect(container.querySelector('[data-stage-code="FINALIZADO"]')).toHaveClass('current')
    expect(container.querySelector('.order-progress-stage.pending')).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    expect(container.querySelector<HTMLElement>('.order-progress-bar > span')).toHaveStyle({ width: '100%' })
  })

  it('presenta un estado vacío cuando la API no devuelve etapas', () => {
    render(<OrderProgress flow={{ estados: [], progreso_porcentaje: 0, cancelado: false }} />)
    expect(screen.getByText('No hay etapas de seguimiento disponibles para este pedido.')).toBeVisible()
  })

  it('conserva visible el estado de un pedido histórico sin flujo detallado', () => {
    render(<OrderProgress flow={{ estados: [], progreso_porcentaje: 0, cancelado: false }} currentStatus={{ id: 7, nombre: 'Entregado', orden: 3 }} />)
    expect(screen.getByRole('status', { name: 'Estado actual del pedido histórico: Entregado' })).toHaveTextContent('Este pedido anterior no cuenta con el desglose completo de etapas.')
  })
})
