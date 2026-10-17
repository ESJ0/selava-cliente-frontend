// La identidad procede del JWT de cliente. El endpoint de login no expone el
// perfil completo, por lo que nombre y apellido son opcionales en la sesión.
export interface ClientSession {
  customer: { id: number; email?: string; nombre?: string; apellido?: string }
  token: string
}
