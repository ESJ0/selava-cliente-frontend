import { describe, expect, it } from 'vitest'
import { isActiveOrder } from './format'

describe('isActiveOrder', () => {
  it.each(['Finalizado', 'Entregado', 'Cancelado'])('trata %s como estado terminal', status => {
    expect(isActiveOrder(status)).toBe(false)
  })

  it.each(['Recibido', 'En lavado', 'Rackeado'])('mantiene %s como estado activo', status => {
    expect(isActiveOrder(status)).toBe(true)
  })
})
