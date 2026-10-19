export interface PaymentMethod {
  id: number
  nombre: string
  activo?: boolean
}

export interface OwnPayment {
  id: number
  pedido_id: number
  monto: number
  referencia?: string
  fecha_pago: string
  metodo_pago: PaymentMethod
}

export interface OrderBalance {
  pedido_id: number
  total: number
  total_pagado: number
  saldo_pendiente: number
}
