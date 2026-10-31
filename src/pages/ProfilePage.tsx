import axios from 'axios'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  changeClientPassword, deleteClientProfilePhoto, getClientProfile, getClientProfilePhoto,
  updateClientProfile, uploadClientProfilePhoto,
} from '../api/profile'
import { PageHeading, PortalError, PortalLoading, delay } from '../components/portal/PortalBits'
import { CameraIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon, SaveIcon, SpinnerIcon, UploadIcon, UserIcon } from '../components/portal/icons'
import { useClientSession } from '../store/session'
import type { ClientProfileUpdate } from '../types/profile'
import { initialsOf } from '../utils/portal'

const emptyProfile: ClientProfileUpdate = { nombre: '', apellido: '', telefono: '', email: '', direccion: '' }
const strengthColors = ['#E07A1F', '#FFC93C', '#0E9BD6', '#0A2433']
const strengthLabels = ['Escribe tu nueva contraseña', 'Débil', 'Regular', 'Buena', 'Excelente']

function apiError(error: unknown, fallback: string) {
  if (!axios.isAxiosError<{ error?: string }>(error)) return fallback
  return error.response?.data?.error ?? fallback
}

function passwordRequirements(password: string): [string, boolean][] {
  return [
    ['8 caracteres o más', password.length >= 8],
    ['Mayúscula y minúscula', /[a-z]/.test(password) && /[A-Z]/.test(password)],
    ['Al menos un número', /\d/.test(password)],
    ['Un símbolo (!, #, $…)', /[^A-Za-z0-9]/.test(password)],
  ]
}

const fields: { key: keyof ClientProfileUpdate; label: string; type?: string; autoComplete: string; maxLength: number; wide?: boolean }[] = [
  { key: 'nombre', label: 'Nombre', autoComplete: 'given-name', maxLength: 100 },
  { key: 'apellido', label: 'Apellido', autoComplete: 'family-name', maxLength: 100 },
  { key: 'telefono', label: 'Teléfono', type: 'tel', autoComplete: 'tel', maxLength: 20 },
  { key: 'email', label: 'Correo electrónico', type: 'email', autoComplete: 'email', maxLength: 150 },
  { key: 'direccion', label: 'Dirección', autoComplete: 'street-address', maxLength: 255, wide: true },
]

export function ProfilePage() {
  const [saved, setSaved] = useState(emptyProfile)
  const [profile, setProfile] = useState(emptyProfile)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [tab, setTab] = useState(0)
  const [saving, setSaving] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [dataError, setDataError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' })
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordDone, setPasswordDone] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const toastTimer = useRef<number | undefined>(undefined)
  const session = useClientSession((state) => state.session)
  const setSession = useClientSession((state) => state.setSession)

  useEffect(() => {
    let active = true
    let objectUrl = ''
    setStatus('loading')
    getClientProfile().then(async (response) => {
      if (!active) return
      const loaded = { nombre: response.nombre, apellido: response.apellido, telefono: response.telefono, email: response.email, direccion: response.direccion ?? '' }
      setSaved(loaded)
      setProfile(loaded)
      setHasPhoto(response.tiene_foto_perfil)
      setPhotoUrl('')
      if (response.tiene_foto_perfil) {
        const blob = await getClientProfilePhoto()
        if (active) { objectUrl = URL.createObjectURL(blob); setPhotoUrl(objectUrl) }
      }
      if (active) setStatus('ready')
    }).catch(() => { if (active) setStatus('error') })
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [reloadKey])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  function flash(text: string) {
    setToast(text)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3200)
  }

  const dirty = (Object.keys(profile) as (keyof ClientProfileUpdate)[]).some((key) => profile[key] !== saved[key])

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setDataError('')
    if (!dirty || saving) return
    if (!profile.nombre.trim() || !profile.apellido.trim() || !profile.telefono.trim() || !profile.email.trim()) {
      setDataError('Completa nombre, apellido, teléfono y correo.'); return
    }
    setSaving(true)
    try {
      const updated = await updateClientProfile({
        nombre: profile.nombre.trim(), apellido: profile.apellido.trim(), telefono: profile.telefono.trim(),
        email: profile.email.trim().toLowerCase(), direccion: profile.direccion.trim(),
      })
      const next = { nombre: updated.nombre, apellido: updated.apellido, telefono: updated.telefono, email: updated.email, direccion: updated.direccion ?? '' }
      setSaved(next)
      setProfile(next)
      if (session) setSession({ ...session, customer: { id: updated.id, nombre: updated.nombre, apellido: updated.apellido, email: updated.email } })
      flash('Tus datos se actualizaron correctamente.')
    } catch (cause) { setDataError(apiError(cause, 'No pudimos actualizar tus datos.')) }
    finally { setSaving(false) }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordError('')
    if (passwordBusy) return
    if (!passwords.actual) { setPasswordError('Escribe tu contraseña actual.'); return }
    if (passwords.nueva.length < 8) { setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.'); return }
    if (new TextEncoder().encode(passwords.nueva).length > 72) { setPasswordError('La nueva contraseña no puede superar los 72 bytes.'); return }
    if (passwords.nueva !== passwords.confirmar) { setPasswordError('La confirmación no coincide con la nueva contraseña.'); return }
    setPasswordBusy(true)
    try {
      await changeClientPassword(passwords.actual, passwords.nueva)
      setPasswords({ actual: '', nueva: '', confirmar: '' })
      setPasswordDone(true)
      flash('Tu contraseña fue actualizada.')
    } catch (cause) { setPasswordError(apiError(cause, 'No pudimos cambiar tu contraseña.')) }
    finally { setPasswordBusy(false) }
  }

  async function selectPhoto(input: HTMLInputElement) {
    const file = input.files?.[0]
    if (!file) return
    setPhotoError('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setPhotoError('Selecciona una imagen JPEG, PNG o WebP de hasta 2 MB.'); input.value = ''; return
    }
    setPhotoBusy(true)
    try { await uploadClientProfilePhoto(file); flash('Tu foto de perfil fue actualizada.'); setReloadKey((key) => key + 1) }
    catch (cause) { setPhotoError(apiError(cause, 'No pudimos actualizar tu foto.')) }
    finally { setPhotoBusy(false); input.value = '' }
  }

  async function removePhoto() {
    setPhotoBusy(true); setPhotoError('')
    try { await deleteClientProfilePhoto(); setHasPhoto(false); setPhotoUrl(''); flash('Tu foto de perfil fue eliminada.') }
    catch (cause) { setPhotoError(apiError(cause, 'No pudimos eliminar tu foto.')) }
    finally { setPhotoBusy(false) }
  }

  if (status === 'loading') return <div className="cp-main"><PortalLoading label="Cargando tu perfil…" /></div>
  if (status === 'error') return <div className="cp-main"><PortalError title="No pudimos cargar tu perfil." retry={() => setReloadKey((key) => key + 1)} /></div>

  const fullName = `${profile.nombre.trim()} ${profile.apellido.trim()}`.trim()
  const requirements = passwordRequirements(passwords.nueva)
  let score = requirements.filter(([, ok]) => ok).length
  if (passwords.nueva.length > 0 && passwords.nueva.length < 8) score = Math.min(score, 1)
  const match = passwords.confirmar.length > 0 && passwords.confirmar === passwords.nueva
  const passwordType = showPasswords ? 'text' : 'password'

  return (
    <div className="cp-main">
      <PageHeading plain title="Mi perfil." lead="Administra tus datos personales y la seguridad de tu cuenta." />

      <div className="cp-pcols">
        <div className="cp-col">
          <div className="cp-flip cp-st" style={delay(.22)}>
            <div className="cp-inner" style={{ transform: `rotateY(${tab * 180}deg)` }}>
              <section className="cp-face cp-front" aria-hidden={tab === 1} aria-label="Tarjeta de cliente">
                <span className="cp-shine" aria-hidden="true" />
                <div className="cp-face-top">
                  <span className="cp-disp" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Se<span style={{ color: '#5BC3EC' }}>Lava</span></span>
                  <span className="cp-face-tag" style={{ color: '#FFC93C' }}>TARJETA DE CLIENTE</span>
                </div>
                <div className="cp-who">
                  <div className="cp-av">{photoUrl ? <img className="cp-avimg" src={photoUrl} alt="Foto de perfil" /> : <span className="cp-disp">{initialsOf(fullName, '?')}</span>}</div>
                  <div style={{ minWidth: 0 }}>
                    <p className="cp-disp cp-who-name">{fullName || 'Tu nombre'}</p>
                    <p>Cliente SeLava</p>
                  </div>
                </div>
                <dl className="cp-cardrows">
                  <div><dt>Teléfono</dt><dd>{profile.telefono || '—'}</dd></div>
                  <div><dt>Correo</dt><dd>{profile.email || '—'}</dd></div>
                  <div><dt>Dirección</dt><dd>{profile.direccion || '—'}</dd></div>
                </dl>
              </section>
              <section className="cp-face cp-back" aria-hidden={tab === 0} aria-label="Seguridad de la cuenta">
                <div className="cp-face-top">
                  <span className="cp-face-tag">SEGURIDAD</span>
                  <span className={`cp-lock${passwordDone ? ' ok' : passwords.nueva ? ' open' : ''}`} aria-hidden="true">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2.5" /><path className="cp-shackle" d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                  </span>
                </div>
                <p className="cp-disp cp-back-title">{passwordDone ? 'Contraseña actualizada' : 'Protege tu cuenta'}</p>
                <p style={{ margin: '0 0 22px', fontSize: 14 }}>{passwordDone ? 'Tu cuenta está segura con tu nueva contraseña.' : match ? 'Las contraseñas coinciden.' : 'Elige una contraseña que solo tú conozcas.'}</p>
                <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
                  {[0, 1, 2, 3].map((index) => <span key={index} className="cp-sgb" style={{ background: index < score ? strengthColors[score - 1] : 'rgba(10,36,51,.18)' }} />)}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 600 }}>{passwords.nueva ? strengthLabels[Math.max(score, 1)] : strengthLabels[0]}</p>
              </section>
            </div>
          </div>

          <section className="cp-card-sm cp-st" style={delay(.3)} aria-labelledby="photo-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span className="cp-hi"><CameraIcon size={22} /></span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <h2 className="cp-disp" id="photo-title" style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Foto de perfil</h2>
                <p style={{ margin: '2px 0 0', fontSize: 14, color: '#5A7280' }}>JPEG, PNG o WebP. Tamaño máximo: 2 MB.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
              <label className={`cp-upl${photoBusy ? ' busy' : ''}`}>
                <input type="file" accept="image/jpeg,image/png,image/webp" disabled={photoBusy} onChange={(event) => void selectPhoto(event.currentTarget)} />
                {photoBusy ? <SpinnerIcon className="cp-spin" size={18} /> : <UploadIcon size={18} />}
                {hasPhoto ? 'Cambiar foto' : 'Agregar foto'}
              </label>
              {hasPhoto && <button className="cp-ghost" type="button" disabled={photoBusy} onClick={() => void removePhoto()}>Quitar foto</button>}
            </div>
            {photoError && <p className="cp-err" role="alert">{photoError}</p>}
          </section>
        </div>

        <section className="cp-card cp-st" style={{ ...delay(.28), padding: '10px 10px 28px' }} aria-label="Editar perfil">
          <div role="tablist" aria-label="Secciones del perfil" className="cp-seg">
            <span className="cp-segpill" style={{ transform: `translateX(${tab * 100}%)` }} aria-hidden="true" />
            <button type="button" role="tab" aria-selected={tab === 0} onClick={() => setTab(0)}><UserIcon size={18} />Datos personales</button>
            <button type="button" role="tab" aria-selected={tab === 1} onClick={() => setTab(1)}><LockIcon size={18} />Contraseña</button>
          </div>

          <div style={{ padding: '24px 20px 0' }}>
            {tab === 0 ? (
              <form className="cp-pane" onSubmit={saveProfile} noValidate>
                <div className="cp-g2">
                  {fields.map((field) => (
                    <div key={field.key} className={`cp-row${field.wide ? ' cp-span2' : ''}`}>
                      <label className="cp-lb" htmlFor={`p-${field.key}`}>{field.label}</label>
                      <input className="cp-bx" id={`p-${field.key}`} type={field.type ?? 'text'} autoComplete={field.autoComplete} maxLength={field.maxLength} value={profile[field.key]} disabled={saving}
                        onChange={(event) => setProfile((current) => ({ ...current, [field.key]: event.target.value }))} />
                    </div>
                  ))}
                </div>
                {dataError && <p className="cp-err" role="alert">{dataError}</p>}
                <div className="cp-actions">
                  <p className={`cp-dirty${dirty ? ' on' : ''}`}><span className="cp-ddot" />{saving ? 'Guardando…' : dirty ? 'Tienes cambios sin guardar' : 'Todo está guardado'}</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {dirty && <button className="cp-ghost" type="button" disabled={saving} onClick={() => { setProfile(saved); setDataError('') }}>Descartar</button>}
                    <button className="cp-save" type="submit" disabled={!dirty || saving}>
                      {saving ? <SpinnerIcon className="cp-spin" size={18} /> : <SaveIcon size={18} />}
                      {saving ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form className="cp-pane" onSubmit={changePassword} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div className="cp-row">
                    <label className="cp-lb" htmlFor="p-cur">Contraseña actual</label>
                    <div className="cp-pw">
                      <input className="cp-bx" id="p-cur" type={passwordType} autoComplete="current-password" value={passwords.actual} disabled={passwordBusy}
                        onChange={(event) => { setPasswords((current) => ({ ...current, actual: event.target.value })); setPasswordError(''); setPasswordDone(false) }} />
                      <button className="cp-eye2" type="button" onClick={() => setShowPasswords((value) => !value)} aria-label={showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}>
                        {showPasswords ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="cp-g2">
                    <div className="cp-row"><label className="cp-lb" htmlFor="p-new">Nueva contraseña</label>
                      <input className="cp-bx" id="p-new" type={passwordType} autoComplete="new-password" value={passwords.nueva} disabled={passwordBusy}
                        onChange={(event) => { setPasswords((current) => ({ ...current, nueva: event.target.value })); setPasswordError(''); setPasswordDone(false) }} /></div>
                    <div className="cp-row"><label className="cp-lb" htmlFor="p-new2">Confirmar nueva contraseña</label>
                      <input className="cp-bx" id="p-new2" type={passwordType} autoComplete="new-password" value={passwords.confirmar} disabled={passwordBusy}
                        onChange={(event) => { setPasswords((current) => ({ ...current, confirmar: event.target.value })); setPasswordError(''); setPasswordDone(false) }} /></div>
                  </div>
                </div>
                <ul className="cp-reqs">
                  {requirements.map(([label, ok]) => <li key={label} className={ok ? 'ok' : ''}><span className="cp-rk"><CheckIcon size={12} strokeWidth={3.4} /></span>{label}</li>)}
                </ul>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5A7280' }}>Mínimo 8 caracteres; admite hasta 72 bytes.</p>
                {passwordError && <p className="cp-err" role="alert">{passwordError}</p>}
                <div className="cp-actions">
                  <span />
                  <button className="cp-save" type="submit" disabled={passwordBusy}>
                    {passwordBusy ? <SpinnerIcon className="cp-spin" size={18} /> : <LockIcon size={18} strokeWidth={2} />}
                    {passwordBusy ? 'Actualizando…' : 'Actualizar contraseña'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>

      {toast && (
        <div className="cp-toasts">
          <div className="cp-toast" role="status" style={{ padding: '14px 20px 14px 14px' }}><span className="cp-tk2"><CheckIcon size={18} /></span>{toast}</div>
        </div>
      )}
    </div>
  )
}
