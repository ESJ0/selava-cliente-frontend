// Contrato de presentacion para integrar la futura autenticacion de clientes.
// No corresponde al Usuario/JWT administrativo del backend actual.
export interface ClientSession {
  customer: { id: number; nombre: string; apellido: string }
  token: string
}
