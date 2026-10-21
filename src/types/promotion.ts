/** Instantánea persistida por el backend; no se reconstruye con el catálogo. */
export interface AppliedPromotion {
  promocion_id: number
  nombre: string
  tipo_prenda_id: number
  tipo_prenda_nombre: string
  modalidad_cobro_aplicada: 'UNIDAD' | 'LIBRA' | 'METRO'
  medida_requerida: number
  precio_promocional: number
  aplicaciones: number
  medida_cubierta: number
  sobrante: number
  precio_normal_aplicado: number
  subtotal_promocional: number
  subtotal_normal: number
  subtotal_total: number
  prenda_ids?: number[]
}
