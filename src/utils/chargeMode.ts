import { formatCurrency } from './format'

export type ChargeMode = 'UNIDAD' | 'LIBRA' | 'METRO'

const units: Record<ChargeMode, string> = { UNIDAD: 'unidad', LIBRA: 'libra', METRO: 'metro' }
const measureFormatter = new Intl.NumberFormat('es-GT', { maximumFractionDigits: 3 })

export function chargeUnit(mode: ChargeMode = 'UNIDAD'): string {
  return units[mode]
}

export function formatChargeRate(price: number, mode: ChargeMode = 'UNIDAD'): string {
  return `${formatCurrency(price)} por ${chargeUnit(mode)}`
}

export function formatAppliedMeasure(measure: number, mode: ChargeMode = 'UNIDAD'): string {
  const unit = mode === 'LIBRA' ? 'lb' : mode === 'METRO' ? 'm' : measure === 1 ? 'unidad' : 'unidades'
  return `${measureFormatter.format(measure)} ${unit}`
}
