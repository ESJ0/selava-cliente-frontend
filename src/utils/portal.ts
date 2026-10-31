import type { OrderFlowStage, OwnOrderFlow } from '../types/order'

const amount = new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const shortDate = new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'numeric', year: 'numeric' })
const weekday = new Intl.DateTimeFormat('es-GT', { weekday: 'long' })
const dayMonth = new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'long' })
const dateTime = new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export const SELAVA_PHONE = '2474-0193'
export const SELAVA_PHONE_HREF = 'tel:24740193'

/** Importe con el formato del diseño: "Q 1,234.50". */
export function money(value: number): string {
  return `Q ${amount.format(value)}`
}

export function formatShortDate(value?: string): string {
  return value ? shortDate.format(new Date(value)) : 'Por confirmar'
}

export function formatLongDate(value?: string): string {
  if (!value) return 'Pendiente de confirmar'
  const date = new Date(value)
  const text = `${weekday.format(date)} ${dayMonth.format(date)}, ${date.getFullYear()}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatDateTime(value: string): string {
  return dateTime.format(new Date(value))
}

/** Días naturales entre hoy y la fecha indicada (negativo si ya pasó). */
export function daysUntil(value?: string): number | null {
  if (!value) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(value)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

export function countdown(value?: string): { value: string; unit: string } {
  const days = daysUntil(value)
  if (days === null) return { value: '—', unit: 'por confirmar' }
  if (days > 1) return { value: String(days), unit: 'días' }
  if (days === 1) return { value: '1', unit: 'día' }
  if (days === 0) return { value: 'Hoy', unit: 'entrega' }
  return { value: '—', unit: 'entrega' }
}

export function countdownText(value?: string): string {
  const days = daysUntil(value)
  if (days === null) return 'por confirmar'
  if (days > 1) return `faltan ${days} días`
  if (days === 1) return 'mañana'
  if (days === 0) return 'hoy'
  return 'fecha cumplida'
}

export function sortedStages(flow?: OwnOrderFlow): OrderFlowStage[] {
  return [...(flow?.estados ?? [])].sort((a, b) => a.orden - b.orden)
}

/** Índice de la etapa actual del flujo; si el backend no marca ninguna, la última completada. */
export function currentStageIndex(stages: OrderFlowStage[]): number {
  const current = stages.findIndex((stage) => stage.actual)
  if (current >= 0) return current
  let last = -1
  stages.forEach((stage, index) => { if (stage.completado) last = index })
  return Math.max(last, 0)
}

export function initialsOf(name: string, fallback = 'C'): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || fallback
}
