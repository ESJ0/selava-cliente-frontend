export interface ClientNotification {
  id: number
  cliente_id: number
  pedido_id?: number
  mensaje: string
  leida: boolean
  created_at: string
}

export interface ClientNotificationsResponse {
  notificaciones: ClientNotification[]
  no_leidas: number
}
