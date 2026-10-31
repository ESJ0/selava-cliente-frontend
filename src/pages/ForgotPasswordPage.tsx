import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authErrorDetails, requestPasswordReset } from '../api/clientAuth'
import { AuthShell } from '../components/AuthShell'
import { AuthField, AuthHeading, AuthNote, CheckIcon, MailIcon, Spinner } from '../components/auth/AuthParts'

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

  if (message) {
    return <AuthShell panel="recovery">
      <div className="sl-done">
        <div className="sl-pop" style={{ position: 'relative', width: 112, height: 112, margin: '0 auto 28px', borderRadius: '50%', background: '#DDF1FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A2433' }}>
          <MailIcon size={52} strokeWidth={1.6} />
          <span className="sl-pop" style={{ animationDelay: '.3s', position: 'absolute', right: 2, top: 2, width: 36, height: 36, borderRadius: '50%', background: '#FFC93C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckIcon size={18} strokeWidth={3} />
          </span>
        </div>
        <h1 className="sl-disp sl-st sl-done-title" style={{ animationDelay: '.2s' }}>Revisa tu correo</h1>
        <p className="sl-st sl-done-text" style={{ animationDelay: '.3s' }} role="status">{message}</p>
        <Link className="sl-btn sl-st" to="/login" style={{ animationDelay: '.4s' }}><span>Volver a iniciar sesión</span></Link>
        <button className="sl-lnk sl-st" type="button" onClick={() => setMessage('')} style={{ animationDelay: '.5s', marginTop: 16 }}>¿No te llegó? Enviar de nuevo</button>
      </div>
    </AuthShell>
  }

  return <AuthShell panel="recovery">
    <AuthHeading kicker="Recuperar acceso" title={<>¿Olvidaste tu{' '}<br />contraseña?</>} lead="Tranquilo, pasa. Te enviaremos un enlace seguro si el correo está registrado en SeLava." />
    {error && <AuthNote tone="err">{error}</AuthNote>}
    <form onSubmit={submit} noValidate>
      <AuthField id="recovery-email" label="Correo electrónico" animationDelay=".34s" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" inputMode="email" disabled={loading} />
      <div className="sl-st" style={{ animationDelay: '.44s', marginTop: 36 }}>
        <button className="sl-btn" type="submit" disabled={loading}>
          {loading ? <><Spinner /><span>Enviando…</span></> : <><MailIcon /><span>Enviar enlace</span></>}
        </button>
      </div>
    </form>
    <p className="sl-st sl-switch" style={{ animationDelay: '.52s', marginTop: 24 }}>¿La recordaste? <Link className="sl-lnk" to="/login">Volver a iniciar sesión</Link></p>
  </AuthShell>
}
