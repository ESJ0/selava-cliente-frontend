import { useState, type FormEvent } from 'react'
import { LoaderCircle, LogIn } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { adminHandoffURL, authErrorDetails, loginUnified } from '../api/clientAuth'
import { AuthShell } from '../components/AuthShell'
import { useClientSession } from '../store/session'
import { validateLogin } from '../utils/clientAuthValidation'

interface LoginLocationState {
  registrationCompleted?: boolean
  email?: string
  from?: string
}

export function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LoginLocationState | null
  const session = useClientSession((current) => current.session)
  const setSession = useClientSession((current) => current.setSession)
  const [email, setEmail] = useState(state?.email ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/inicio" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validateLogin(email, password)
    setErrors(validationErrors)
    setSubmitError('')
    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      const result = await loginUnified(email.trim().toLowerCase(), password)
      if (result.kind === 'admin') {
        window.location.assign(adminHandoffURL(result.token))
        return
      }
      setSession(result.session)
      const destination = state?.from?.startsWith('/') ? state.from : '/inicio'
      navigate(destination, { replace: true })
    } catch (error) {
      const details = authErrorDetails(error, 'No pudimos iniciar sesión. Inténtalo de nuevo.')
      setErrors({ email: details.fields.email, password: details.fields.password })
      setSubmitError(details.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Inicia sesión" description="Consulta tus pedidos y mantente al día con el cuidado de tus prendas.">
      {state?.registrationCompleted && (
        <div className="form-message form-message-success" role="status">
          Tu cuenta fue creada. Ya puedes iniciar sesión.
        </div>
      )}
      {submitError && <div className="form-message form-message-error" role="alert">{submitError}</div>}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={email}
            onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })) }}
            autoComplete="email"
            inputMode="email"
            maxLength={150}
            disabled={loading}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
          {errors.email && <span id="login-email-error" className="field-error">{errors.email}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            name="password"
            value={password}
            onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })) }}
            autoComplete="current-password"
            disabled={loading}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
          />
          {errors.password && <span id="login-password-error" className="field-error">{errors.password}</span>}
        </div>
        <button className="button auth-submit" type="submit" disabled={loading}>
          {loading ? <><LoaderCircle className="loading-icon" size={18} aria-hidden="true" />Iniciando sesión...</> : <><LogIn size={18} aria-hidden="true" />Iniciar sesión</>}
        </button>
        <Link className="forgot-password-link" to="/recuperar-contrasena">Olvidé mi contraseña</Link>
      </form>
      <p className="auth-switch">¿Aún no tienes cuenta? <Link to="/registro">Crear una cuenta</Link></p>
    </AuthShell>
  )
}
