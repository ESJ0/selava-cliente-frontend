/// <reference types="node" />

import { render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { OwnOrderFlow } from '../types/order'
import { OrderProgress } from './OrderProgress'

const styles = readFileSync(resolve(process.cwd(), 'src/styles/index.css'), 'utf8')

const flow: OwnOrderFlow = {
  progreso_porcentaje: 50,
  cancelado: false,
  estados: [
    { id: 1, nombre: 'Recibido', codigo: 'RECIBIDO', orden: 10, servicios: [], completado: true, actual: false },
    { id: 2, nombre: 'En lavado', codigo: 'EN_LAVADO', orden: 20, servicios: [{ id: 5, nombre: 'Lavado' }], completado: true, actual: true },
    { id: 3, nombre: 'Rackeado', codigo: 'RACKEADO', orden: 50, servicios: [], completado: false, actual: false },
    { id: 4, nombre: 'Finalizado', codigo: 'FINALIZADO', orden: 60, servicios: [], completado: false, actual: false },
  ],
}

describe.each([
  { device: 'móvil', width: 390 },
  { device: 'tablet', width: 768 },
  { device: 'escritorio', width: 1440 },
])('OrderProgress en $device', ({ width }) => {
  it('mantiene visibles y accesibles todas las etapas', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    window.dispatchEvent(new Event('resize'))
    render(<OrderProgress flow={flow} />)

    const timeline = screen.getByRole('list', { name: 'Progreso del pedido' })
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
    expect(within(timeline).getByText('Estado actual')).toBeVisible()
  })
})

describe('reglas responsive de OrderProgress', () => {
  it('mantiene una cuadrícula horizontal en tablet y escritorio', () => {
    expect(styles).toContain('grid-template-columns: repeat(var(--stage-count), minmax(0, 1fr))')
  })

  it('convierte el timeline en una columna vertical en móvil', () => {
    expect(styles).toContain('@media (max-width: 520px)')
    expect(styles).toContain('.order-progress-stages { grid-template-columns: 1fr')
    expect(styles).toContain('.order-progress-stage:not(:last-child)::after { left: 21px; right: auto')
  })
})
