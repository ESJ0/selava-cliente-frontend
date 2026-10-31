import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authErrorDetails, resetPassword, validatePasswordResetToken } from '../api/clientAuth'
import { AuthShell } from '../components/AuthShell'
import { ArrowRight, AuthField, AuthHeading, AuthNote, CheckIcon, Spinner } from '../components/auth/AuthParts'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    if (!token) { setValidating(false); setValid(false); return () => controller.abort() }
    validatePasswordResetToken(token, controller.signal).then(() => setValid(true)).catch(() => setValid(false)).finally(() => setValidating(false))
    return () => controller.abort()
  }, [token])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (password !== confirmation) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try { setMessage(await resetPassword(token, password)); setValid(false) }
    catch (cause) { setError(authErrorDetails(cause, 'El enlace venció o no es válido. Solicita uno nuevo.').message) }
    finally { setLoading(false) }
  }

  if (validating) {
    return <AuthShell panel="recovery">
      <div className="sl-done" role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: '#3E5866', fontSize: 17 }}><Spinner />Validando enlace…</div>
    </AuthShell>
  }

  if (message) {
    return <AuthShell panel="recovery">
      <div className="sl-done">
        <div className="sl-pop sl-done-badge"><CheckIcon /></div>
        <h1 className="sl-disp sl-st sl-done-title" style={{ animationDelay: '.2s' }}>¡Listo!</h1>
        <p className="sl-st sl-done-text" style={{ animationDelay: '.3s' }} role="status">{message}</p>
        <Link className="sl-btn sl-st" to="/login" style={{ animationDelay: '.4s' }}><span>Iniciar sesión</span></Link>
      </div>
    </AuthShell>
  }

  if (!valid) {
    return <AuthShell panel="recovery">
      <AuthHeading kicker="Recuperar acceso" title={<>Enlace no{' '}<br />disponible.</>} lead="Puedes solicitar un enlace nuevo en unos segundos." />
      <AuthNote tone="err">El enlace venció, ya fue utilizado o no es válido.</AuthNote>
      <Link className="sl-btn sl-st" to="/recuperar-contrasena" style={{ animationDelay: '.34s' }}><span>Solicitar un enlace nuevo</span><ArrowRight /></Link>
    </AuthShell>
  }

  const type = showPasswords ? 'text' : 'password'
  return <AuthShell panel="recovery">
    <AuthHeading kicker="Recuperar acceso" title={<>Nueva{' '}<br />contraseña.</>} lead="Crea una contraseña segura para volver a ingresar a tu cuenta." />
    {error && <AuthNote tone="err">{error}</AuthNote>}
    <form onSubmit={submit} noValidate>
      <div className="sl-fields">
        <AuthField id="new-password" label="Nueva contraseña" animationDelay=".34s" type={type} value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" disabled={loading} revealed={showPasswords} onToggleReveal={() => setShowPasswords(current => !current)} revealLabels={['Mostrar contraseñas', 'Ocultar contraseñas']} />
        <AuthField id="confirm-password" label="Confirmar contraseña" animationDelay=".42s" type={type} value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="new-password" disabled={loading} />
      </div>
      <div className="sl-st" style={{ animationDelay: '.5s', marginTop: 36 }}>
        <button className="sl-btn" type="submit" disabled={loading}>
          {loading ? <><Spinner /><span>Guardando…</span></> : <><span>Cambiar contraseña</span><ArrowRight /></>}
        </button>
      </div>
    </form>
  </AuthShell>
}
