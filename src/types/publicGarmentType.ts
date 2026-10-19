import type { ChargeMode } from '../utils/chargeMode'

export interface PublicGarmentType {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  modalidad_cobro: ChargeMode
}
