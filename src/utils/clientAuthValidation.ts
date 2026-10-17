export interface RegistrationFormValues {
  nombre: string
  apellido: string
  telefono: string
  email: string
  direccion: string
  password: string
  confirmPassword: string
}

export type RegistrationField = keyof RegistrationFormValues
export type RegistrationErrors = Partial<Record<RegistrationField, string>>

const namePattern = /^[\p{L}\s'-]+$/u
const phonePattern = /^\+?[0-9\s-]{8,15}$/
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

function validateName(value: string): string | undefined {
  const normalized = value.trim()
  if (!normalized) return 'Es requerido.'
  if (normalized.length > 100) return 'No puede superar los 100 caracteres.'
  if (!namePattern.test(normalized)) return 'Usa únicamente letras, espacios, apóstrofes o guiones.'
}

export function validateRegistration(values: RegistrationFormValues): RegistrationErrors {
  const errors: RegistrationErrors = {}
  const nombreError = validateName(values.nombre)
  const apellidoError = validateName(values.apellido)
  if (nombreError) errors.nombre = nombreError
  if (apellidoError) errors.apellido = apellidoError

  const telefono = values.telefono.trim()
  if (!telefono) errors.telefono = 'Es requerido.'
  else if (!phonePattern.test(telefono)) errors.telefono = 'Usa entre 8 y 15 caracteres: dígitos, espacios, + o guiones.'

  const email = values.email.trim()
  if (!email) errors.email = 'Es requerido.'
  else if (email.length > 150) errors.email = 'No puede superar los 150 caracteres.'
  else if (!emailPattern.test(email)) errors.email = 'Ingresa un correo electrónico válido.'

  if (values.direccion.length > 255) errors.direccion = 'No puede superar los 255 caracteres.'

  if (!values.password) errors.password = 'Es requerida.'
  else if (!values.password.trim()) errors.password = 'No puede contener solo espacios.'
  else if (Array.from(values.password).length < 8) errors.password = 'Debe tener al menos 8 caracteres.'
  else if (new TextEncoder().encode(values.password).length > 72) errors.password = 'No puede superar los 72 bytes.'

  if (!values.confirmPassword) errors.confirmPassword = 'Confirma tu contraseña.'
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Las contraseñas no coinciden.'

  return errors
}

export function validateLogin(email: string, password: string) {
  const errors: { email?: string; password?: string } = {}
  const normalizedEmail = email.trim()
  if (!normalizedEmail) errors.email = 'Ingresa tu correo electrónico.'
  else if (normalizedEmail.length > 150 || !emailPattern.test(normalizedEmail)) errors.email = 'Ingresa un correo electrónico válido.'
  if (!password) errors.password = 'Ingresa tu contraseña.'
  return errors
}
