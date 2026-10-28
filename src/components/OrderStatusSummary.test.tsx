import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { OrderStatusSummary } from './OrderStatusSummary'

it('resume el estado actual con un icono relacionado', () => {
  const { container, rerender } = render(<OrderStatusSummary status={{ id: 2, nombre: 'En planchado', orden: 40 }} />)

  expect(screen.getByRole('status', { name: 'Estado actual: En planchado' })).toBeVisible()
  expect(container.querySelector('svg')).toHaveClass('lucide-shirt')

  rerender(<OrderStatusSummary status={{ id: 3, nombre: 'Finalizado', codigo: 'FINALIZADO', orden: 60 }} />)
  expect(screen.getByRole('status', { name: 'Estado actual: Finalizado' })).toHaveClass('state-finalizado')
  expect(container.querySelector('svg')).toHaveClass('lucide-badge-check')
})
