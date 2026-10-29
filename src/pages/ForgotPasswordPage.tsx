import { useState, type FormEvent } from 'react'
import { LoaderCircle, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { authErrorDetails, requestPasswordReset } from '../api/clientAuth'
import { AuthShell } from '../components/AuthShell'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) { setError('Ingresa tu correo electrónico.'); return }
    setLoading(true); setError(''); setMessage('')
    try { setMessage(await requestPasswordReset(email.trim().toLowerCase())) }
    catch (cause) { setError(authErrorDetails(cause, 'No pudimos procesar la solicitud. Inténtalo nuevamente.').message) }
    finally { setLoading(false) }
  }
  return <AuthShell title="Recupera tu contraseña" description="Te enviaremos un enlace seguro si el correo está registrado en SeLava.">
    {message && <div className="form-message form-message-success" role="status">{message}</div>}
    {error && <div className="form-message form-message-error" role="alert">{error}</div>}
    <form className="auth-form" onSubmit={submit}>
      <div className="form-field"><label htmlFor="recovery-email">Correo electrónico</label><input id="recovery-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" disabled={loading}/></div>
      <button className="button auth-submit" disabled={loading}>{loading ? <><LoaderCircle className="loading-icon" size={18}/>Enviando…</> : <><Mail size={18}/>Enviar enlace</>}</button>
    </form>
    <p className="auth-switch"><Link to="/login">Volver a iniciar sesión</Link></p>
  </AuthShell>
}
