import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { adminHandoffURL, authErrorDetails, loginUnified } from '../api/clientAuth'
import { AuthShell } from '../components/AuthShell'
import { ArrowRight, AuthField, AuthHeading, AuthNote, Spinner } from '../components/auth/AuthParts'
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
  const [showPassword, setShowPassword] = useState(false)

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
    <AuthShell panel="login">
      <AuthHeading kicker="Portal de clientes" title={<>Hola de{' '}<br />nuevo.</>} lead="Consulta tus pedidos y mantente al día con el cuidado de tus prendas." />
      {state?.registrationCompleted && <AuthNote tone="ok">Tu cuenta fue creada. Ya puedes iniciar sesión.</AuthNote>}
      {submitError && <AuthNote tone="err">{submitError}</AuthNote>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="sl-fields">
          <AuthField
            id="login-email"
            label="Correo electrónico"
            animationDelay=".34s"
            type="email"
            name="email"
            value={email}
            onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })) }}
            autoComplete="email"
            inputMode="email"
            maxLength={150}
            disabled={loading}
            error={errors.email}
          />
          <AuthField
            id="login-password"
            label="Contraseña"
            animationDelay=".42s"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })) }}
            autoComplete="current-password"
            disabled={loading}
            error={errors.password}
            revealed={showPassword}
            onToggleReveal={() => setShowPassword((current) => !current)}
          />
        </div>
        <div className="sl-st" style={{ animationDelay: '.5s', display: 'flex', justifyContent: 'flex-end', margin: '10px 0 28px' }}>
          <Link className="sl-lnk" to="/recuperar-contrasena" style={{ fontSize: 15 }}>Olvidé mi contraseña</Link>
        </div>
        <div className="sl-st" style={{ animationDelay: '.58s' }}>
          <button className="sl-btn" type="submit" disabled={loading}>
            {loading ? <><Spinner /><span>Lavando tus datos…</span></> : <><span>Iniciar sesión</span><ArrowRight /></>}
          </button>
        </div>
      </form>
      <p className="sl-st sl-switch" style={{ animationDelay: '.66s' }}>¿Aún no tienes cuenta? <Link className="sl-lnk" to="/registro">Crear una cuenta</Link></p>
    </AuthShell>
  )
}
