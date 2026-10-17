import { useState, type FormEvent } from 'react'
import { LoaderCircle, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { authErrorDetails, registerClient } from '../api/clientAuth'
import { AuthShell } from '../components/AuthShell'
import {
  validateRegistration,
  type RegistrationErrors,
  type RegistrationField,
  type RegistrationFormValues,
} from '../utils/clientAuthValidation'

const initialValues: RegistrationFormValues = {
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  direccion: '',
  password: '',
  confirmPassword: '',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<RegistrationErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(field: RegistrationField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validateRegistration(values)
    setErrors(validationErrors)
    setSubmitError('')
    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      await registerClient({
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        telefono: values.telefono.trim(),
        email: values.email.trim().toLowerCase(),
        direccion: values.direccion.trim(),
        password: values.password,
      })
      navigate('/login', {
        replace: true,
        state: { registrationCompleted: true, email: values.email.trim().toLowerCase() },
      })
    } catch (error) {
      const details = authErrorDetails(error, 'No pudimos crear tu cuenta. Inténtalo de nuevo.')
      const serverErrors: RegistrationErrors = {}
      for (const [field, message] of Object.entries(details.fields)) {
        if (field in initialValues) serverErrors[field as RegistrationField] = message
      }
      setErrors(serverErrors)
      setSubmitError(details.message)
    } finally {
      setLoading(false)
    }
  }

  const field = (
    name: RegistrationField,
    label: string,
    options: { type?: string; autoComplete?: string; required?: boolean; maxLength?: number; placeholder?: string } = {},
  ) => (
    <div className={`form-field${name === 'direccion' ? ' form-field-wide' : ''}`}>
      <label htmlFor={`register-${name}`}>{label}{options.required === false && <span> (opcional)</span>}</label>
      <input
        id={`register-${name}`}
        name={name}
        type={options.type ?? 'text'}
        value={values[name]}
        onChange={(event) => updateField(name, event.target.value)}
        autoComplete={options.autoComplete}
        maxLength={options.maxLength}
        placeholder={options.placeholder}
        disabled={loading}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `register-${name}-error` : undefined}
      />
      {errors[name] && <span id={`register-${name}-error`} className="field-error">{errors[name]}</span>}
    </div>
  )

  return (
    <AuthShell wide title="Crea tu cuenta" description="Regístrate para consultar tus pedidos y pagos desde el portal de clientes.">
      {submitError && <div className="form-message form-message-error" role="alert">{submitError}</div>}
      <form className="auth-form registration-form" onSubmit={handleSubmit} noValidate>
        {field('nombre', 'Nombre', { autoComplete: 'given-name', maxLength: 100 })}
        {field('apellido', 'Apellido', { autoComplete: 'family-name', maxLength: 100 })}
        {field('telefono', 'Teléfono', { type: 'tel', autoComplete: 'tel', maxLength: 20, placeholder: '+502 5555-1234' })}
        {field('email', 'Correo electrónico', { type: 'email', autoComplete: 'email', maxLength: 150 })}
        {field('direccion', 'Dirección', { autoComplete: 'street-address', required: false, maxLength: 255 })}
        {field('password', 'Contraseña', { type: 'password', autoComplete: 'new-password' })}
        {field('confirmPassword', 'Confirmar contraseña', { type: 'password', autoComplete: 'new-password' })}
        <p className="password-hint form-field-wide">Usa al menos 8 caracteres. La contraseña admite hasta 72 bytes.</p>
        <button className="button auth-submit form-field-wide" type="submit" disabled={loading}>
          {loading ? <><LoaderCircle className="loading-icon" size={18} aria-hidden="true" />Creando cuenta...</> : <><UserPlus size={18} aria-hidden="true" />Crear cuenta</>}
        </button>
      </form>
      <p className="auth-switch">¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </AuthShell>
  )
}
