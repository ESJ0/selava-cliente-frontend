import type { ChargeMode } from '../utils/chargeMode'

export interface OrderStatus {
  id: number
  nombre: string
  orden: number
}

export interface OwnOrderSummary {
  id: number
  fecha_recibido: string
  fecha_entrega_estimada?: string
  total: number
  estado_actual: OrderStatus
}

export interface OwnOrdersResponse {
  pedidos: OwnOrderSummary[]
  total: number
  pagina: number
  limite: number
}

export interface GarmentType { id: number; nombre: string; descripcion?: string; precio?: number | null; modalidad_cobro?: ChargeMode }
export interface ServiceInfo { id: number; nombre: string; descripcion?: string; precio_base: number; tiempo_estimado_horas?: number }
export interface GarmentService { id: number; servicio_id: number; precio_aplicado: number; servicio?: ServiceInfo }
export interface OrderGarment {
  id: number
  /** NULL/omitido conserva importes históricos por servicio. */
  precio_aplicado?: number | null
  modalidad_cobro_aplicada?: ChargeMode | null
  /** Subtotal de lectura devuelto por el backend; nunca se reconstruye en el navegador. */
  subtotal?: number
  tipo_prenda_id: number
  tipo_prenda?: GarmentType
  descripcion?: string
  cantidad: number
  color?: string
  servicios: GarmentService[]
}

export interface OwnOrderDetail {
  promociones_aplicadas?: import('./promotion').AppliedPromotion[]
  id: number
  fecha_recibido: string
  fecha_entrega_estimada?: string
  fecha_entrega_real?: string
  total: number
  observaciones?: string
  prendas: OrderGarment[]
  estado_actual: OrderStatus
}

export interface OwnOrderHistoryEntry {
  id: number
  pedido_id: number
  estado: OrderStatus
  fecha_cambio: string
  observaciones?: string
}

export interface OwnOrdersParams {
  estado_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  pagina?: number
  limite?: number
  orden?: 'recientes' | 'antiguos'
}
