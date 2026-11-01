import { api } from './client'
import type { ChargeMode } from '../utils/chargeMode'

export interface PublicPromotion {
  id: number
  nombre: string
  descripcion: string
  tipo_prenda_id: number
  tipo_prenda_nombre: string
  modalidad_cobro: ChargeMode
  medida_requerida: number
  precio_promocional: number
  fecha_inicio: string
  fecha_fin: string
}

/** Promociones activas y vigentes (el backend ya excluye las desactivadas o vencidas). */
export async function getPublicPromotions(signal?: AbortSignal): Promise<PublicPromotion[]> {
  const { data } = await api.get<PublicPromotion[]>('/public/promociones', { signal })
  return Array.isArray(data) ? data : []
}
