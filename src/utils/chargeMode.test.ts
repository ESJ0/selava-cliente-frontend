import { expect, it } from 'vitest'
import { chargeUnit, formatAppliedMeasure, formatChargeRate } from './chargeMode'

it.each([['UNIDAD', 'unidad'], ['LIBRA', 'libra'], ['METRO', 'metro']] as const)('identifica la tarifa %s desde su modalidad', (mode, unit) => {
  expect(chargeUnit(mode)).toBe(unit)
  expect(formatChargeRate(12.5, mode)).toMatch(/Q\s*12\.50/)
  expect(formatChargeRate(12.5, mode)).toContain(`por ${unit}`)
})

it('formatea medidas aplicadas y compatibilidad en unidades', () => {
  expect(formatAppliedMeasure(1)).toBe('1 unidad')
  expect(formatAppliedMeasure(3)).toBe('3 unidades')
  expect(formatAppliedMeasure(2.5, 'LIBRA')).toBe('2.5 lb')
  expect(formatAppliedMeasure(1.25, 'METRO')).toBe('1.25 m')
  expect(formatAppliedMeasure(0.125, 'LIBRA')).toBe('0.125 lb')
})
