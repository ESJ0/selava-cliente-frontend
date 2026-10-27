export function orderCode(id: number): string {
  return `SLV-${String(id).padStart(4, '0')}`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value)
}

export function formatDate(value?: string, includeTime = false): string {
  if (!value) return 'Pendiente de confirmar'
  return new Intl.DateTimeFormat('es-GT', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }).format(new Date(value))
}

export function isActiveOrder(status: string): boolean {
  const normalized = status.trim().toLocaleLowerCase('es')
  return !['finalizado', 'entregado', 'cancelado'].includes(normalized)
}
