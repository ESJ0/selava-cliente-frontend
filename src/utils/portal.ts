import type { OrderFlowStage, OwnOrderFlow, OwnOrderSummary } from '../types/order'

const amount = new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const shortDate = new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'numeric', year: 'numeric' })
const weekday = new Intl.DateTimeFormat('es-GT', { weekday: 'long' })
const dayMonth = new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'long' })
const dateTime = new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export const SELAVA_PHONE = '3817-4898'
export const SELAVA_PHONE_HREF = 'tel:+50238174898'

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

const CENT = 0.004

/** Pedido aún en proceso (no Finalizado ni Cancelado). Usa el dato del backend y, si falta, el nombre del estado. */
export function isOrderInProcess(order: OwnOrderSummary): boolean {
  if (typeof order.en_proceso === 'boolean') return order.en_proceso
  const name = order.estado_actual.nombre.trim().toLocaleLowerCase('es')
  return !order.estado_actual.es_terminal && !['finalizado', 'entregado', 'cancelado'].includes(name)
}

export function isOrderCancelled(order: OwnOrderSummary): boolean {
  return order.cancelado ?? order.estado_actual.es_cancelacion ?? order.estado_actual.nombre.trim().toLocaleLowerCase('es') === 'cancelado'
}

/** Total, pagado y saldo oficiales del pedido (calculados en el servidor). */
export function orderAmounts(order: OwnOrderSummary) {
  const paid = order.total_pagado ?? 0
  const balance = order.saldo_pendiente ?? Math.max(0, Math.round((order.total - paid) * 100) / 100)
  const pct = order.total > 0 ? Math.min(100, Math.round((paid / order.total) * 100)) : 100
  return { total: order.total, paid, balance, pct }
}

export type PaymentSituation = 'activo-saldo' | 'activo-pagado' | 'finalizado-saldo' | 'finalizado-pagado' | 'cancelado'

/**
 * Clasificación de pagos del portal:
 * - con saldo (activo o finalizado) → Pagos pendientes, primero los activos;
 * - sin saldo (activo o finalizado) → Historial de pagos.
 * Los cancelados no generan saldo exigible.
 */
export function paymentSituation(order: OwnOrderSummary): PaymentSituation {
  if (isOrderCancelled(order)) return 'cancelado'
  const owes = orderAmounts(order).balance > CENT
  if (isOrderInProcess(order)) return owes ? 'activo-saldo' : 'activo-pagado'
  return owes ? 'finalizado-saldo' : 'finalizado-pagado'
}

export const PAYMENT_SITUATION_LABEL: Record<PaymentSituation, string> = {
  'activo-saldo': 'En proceso · saldo pendiente',
  'activo-pagado': 'En proceso · pagado',
  'finalizado-saldo': 'Finalizado · saldo pendiente',
  'finalizado-pagado': 'Finalizado · pagado',
  cancelado: 'Cancelado',
}

export function garmentsText(order: OwnOrderSummary): string {
  const types = order.tipos_prenda ?? []
  if (types.length === 0) return ''
  return types.length > 3 ? `${types.slice(0, 3).join(', ')} y ${types.length - 3} más` : types.join(', ')
}

export interface HistoryFilterValue { desde: string; hasta: string; tipo: string; estado: string }

export const EMPTY_HISTORY_FILTERS: HistoryFilterValue = { desde: '', hasta: '', tipo: '', estado: '' }

export function hasHistoryFilters(value: HistoryFilterValue): boolean {
  return Boolean(value.desde || value.hasta || value.tipo || value.estado)
}

/** Rango invertido: el backend lo rechaza, así que se avisa sin consultar. */
export function historyRangeError(value: HistoryFilterValue): string {
  return value.desde && value.hasta && value.desde > value.hasta ? 'La fecha "desde" no puede ser posterior a la fecha "hasta".' : ''
}
