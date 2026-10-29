import { useEffect, useState, type FormEvent } from 'react'
import { KeyRound, LoaderCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { authErrorDetails, resetPassword, validatePasswordResetToken } from '../api/clientAuth'
import { AuthShell } from '../components/AuthShell'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
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
  return <AuthShell title="Nueva contraseña" description="Crea una contraseña segura para volver a ingresar a tu cuenta.">
    {validating ? <div className="auth-token-state" role="status"><LoaderCircle className="loading-icon"/>Validando enlace…</div>
      : message ? <><div className="form-message form-message-success" role="status">{message}</div><p className="auth-switch"><Link to="/login">Iniciar sesión</Link></p></>
      : !valid ? <><div className="form-message form-message-error" role="alert">El enlace venció, ya fue utilizado o no es válido.</div><p className="auth-switch"><Link to="/recuperar-contrasena">Solicitar un enlace nuevo</Link></p></>
      : <form className="auth-form" onSubmit={submit}>
        {error && <div className="form-message form-message-error" role="alert">{error}</div>}
        <div className="form-field"><label htmlFor="new-password">Nueva contraseña</label><input id="new-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" disabled={loading}/></div>
        <div className="form-field"><label htmlFor="confirm-password">Confirmar contraseña</label><input id="confirm-password" type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="new-password" disabled={loading}/></div>
        <button className="button auth-submit" disabled={loading}>{loading ? <><LoaderCircle className="loading-icon" size={18}/>Guardando…</> : <><KeyRound size={18}/>Cambiar contraseña</>}</button>
      </form>}
  </AuthShell>
}
