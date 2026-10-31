export interface ClientProfile {
  id: number
  nombre: string
  apellido: string
  telefono: string
  email: string
  direccion?: string
  activo: boolean
  tiene_foto_perfil: boolean
}

export type ClientProfileUpdate = Pick<ClientProfile, 'nombre' | 'apellido' | 'telefono' | 'email'> & { direccion: string }
