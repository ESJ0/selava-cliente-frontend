import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { authErrorDetails, registerClient } from '../api/clientAuth'
import { AuthShell } from '../components/AuthShell'
import { ArrowRight, AuthField, AuthHeading, AuthNote, CheckIcon, Spinner } from '../components/auth/AuthParts'
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

const strengthColors = ['#E07A1F', '#FFC93C', '#0E9BD6', '#0A2433']
const strengthLabels = ['Escribe una contraseña', 'Débil', 'Regular', 'Buena', 'Excelente']

function passwordScore(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (password.length > 0 && password.length < 8) score = Math.min(score, 1)
  return score
}

export function RegisterPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<RegistrationErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

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
      setRegisteredEmail(values.email.trim().toLowerCase())
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

  if (registeredEmail) {
    return (
      <AuthShell panel="register">
        <div className="sl-done" style={{ maxWidth: 440, margin: '0 auto' }}>
          <div className="sl-pop sl-done-badge"><CheckIcon /></div>
          <h1 className="sl-disp sl-st sl-done-title" style={{ animationDelay: '.2s' }}>¡Cuenta creada!</h1>
          <p className="sl-st sl-done-text" style={{ animationDelay: '.3s' }} role="status">Ya puedes iniciar sesión y consultar tus pedidos y pagos.</p>
          <Link className="sl-btn sl-st" to="/login" state={{ email: registeredEmail }} style={{ animationDelay: '.4s' }}><span>Ir a iniciar sesión</span></Link>
        </div>
      </AuthShell>
    )
  }

  const score = passwordScore(values.password)
  const passwordsMatch = values.confirmPassword.length > 0 && values.confirmPassword === values.password
  const field = (
    name: RegistrationField,
    label: ReactNode,
    animationDelay: string,
    options: { type?: string; autoComplete?: string; maxLength?: number; help?: string; className?: string; reveal?: boolean } = {},
  ) => (
    <AuthField
      id={`register-${name}`}
      name={name}
      label={label}
      animationDelay={animationDelay}
      className={options.className}
      type={options.type ?? 'text'}
      value={values[name]}
      onChange={(event) => updateField(name, event.target.value)}
      autoComplete={options.autoComplete}
      maxLength={options.maxLength}
      disabled={loading}
      help={options.help}
      error={errors[name]}
      revealed={showPasswords}
      onToggleReveal={options.reveal ? () => setShowPasswords((current) => !current) : undefined}
      revealLabels={['Mostrar contraseñas', 'Ocultar contraseñas']}
    />
  )
  const passwordType = showPasswords ? 'text' : 'password'

  return (
    <AuthShell panel="register">
      <AuthHeading kicker="Nueva cuenta" title="Crea tu cuenta." lead="Regístrate para consultar tus pedidos y pagos desde el portal de clientes." />
      {submitError && <AuthNote tone="err">{submitError}</AuthNote>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="sl-g2">
          {field('nombre', 'Nombre', '.3s', { autoComplete: 'given-name', maxLength: 100 })}
          {field('apellido', 'Apellido', '.34s', { autoComplete: 'family-name', maxLength: 100 })}
          {field('telefono', 'Teléfono', '.38s', { type: 'tel', autoComplete: 'tel', maxLength: 20, help: 'Ej. +502 5555-1234' })}
          {field('email', 'Correo electrónico', '.42s', { type: 'email', autoComplete: 'email', maxLength: 150 })}
          {field('direccion', <>Dirección <span>(opcional)</span></>, '.46s', { autoComplete: 'street-address', maxLength: 255, className: 'sl-span2' })}
          {field('password', 'Contraseña', '.5s', { type: passwordType, autoComplete: 'new-password', reveal: true })}
          {field('confirmPassword', 'Confirmar contraseña', '.54s', { type: passwordType, autoComplete: 'new-password' })}
        </div>

        <div className="sl-st sl-strength" style={{ animationDelay: '.58s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="sl-segs" aria-hidden="true">
              {[0, 1, 2, 3].map((index) => <span key={index} className="sl-seg" style={{ background: index < score ? strengthColors[score - 1] : '#DCE7EC' }} />)}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3E5866' }} aria-live="polite">{values.password ? strengthLabels[Math.max(score, 1)] : strengthLabels[0]}</span>
          </div>
          {values.confirmPassword.length > 0 && (
            <span className="sl-pop" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: passwordsMatch ? '#06709F' : '#B5541A' }} aria-live="polite">
              {passwordsMatch ? 'Las contraseñas coinciden' : 'Aún no coinciden'}
            </span>
          )}
        </div>
        <p className="sl-st" style={{ animationDelay: '.6s', margin: '-14px 0 28px', fontSize: 13, color: '#5A7280' }}>Usa al menos 8 caracteres. La contraseña admite hasta 72 bytes.</p>

        <div className="sl-st" style={{ animationDelay: '.64s' }}>
          <button className="sl-btn" type="submit" disabled={loading}>
            {loading ? <><Spinner /><span>Preparando tu canasta…</span></> : <><span>Crear cuenta</span><ArrowRight /></>}
          </button>
        </div>
      </form>
      <p className="sl-st sl-switch" style={{ animationDelay: '.7s', marginTop: 24 }}>¿Ya tienes una cuenta? <Link className="sl-lnk" to="/login">Iniciar sesión</Link></p>
    </AuthShell>
  )
}
