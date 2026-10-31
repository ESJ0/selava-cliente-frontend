import axios from 'axios'
import { Camera, KeyRound, Save, Trash2, UserRound } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  changeClientPassword, deleteClientProfilePhoto, getClientProfile, getClientProfilePhoto,
  updateClientProfile, uploadClientProfilePhoto,
} from '../api/profile'
import { Card } from '../components/Card'
import { OrdersError, OrdersLoading } from '../components/OrdersState'
import { useClientSession } from '../store/session'
import type { ClientProfileUpdate } from '../types/profile'

const emptyProfile: ClientProfileUpdate = { nombre: '', apellido: '', telefono: '', email: '', direccion: '' }

function apiError(error: unknown, fallback: string) {
  if (!axios.isAxiosError<{ error?: string }>(error)) return fallback
  return error.response?.data?.error ?? fallback
}

export function ProfilePage() {
  const [profile, setProfile] = useState(emptyProfile)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [saving, setSaving] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' })
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const session = useClientSession((state) => state.session)
  const setSession = useClientSession((state) => state.setSession)

  useEffect(() => {
    let active = true
    let objectUrl = ''
    setStatus('loading')
    getClientProfile().then(async (response) => {
      if (!active) return
      setProfile({ nombre: response.nombre, apellido: response.apellido, telefono: response.telefono, email: response.email, direccion: response.direccion ?? '' })
      setHasPhoto(response.tiene_foto_perfil)
      if (response.tiene_foto_perfil) {
        const blob = await getClientProfilePhoto()
        if (active) { objectUrl = URL.createObjectURL(blob); setPhotoUrl(objectUrl) }
      }
      if (active) setStatus('ready')
    }).catch(() => { if (active) setStatus('error') })
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [reloadKey])

  function updateField(field: keyof ClientProfileUpdate, value: string) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setMessage(''); setError('')
    if (!profile.nombre.trim() || !profile.apellido.trim() || !profile.telefono.trim() || !profile.email.trim()) {
      setError('Completa nombre, apellido, teléfono y correo.'); return
    }
    setSaving(true)
    try {
      const updated = await updateClientProfile({
        nombre: profile.nombre.trim(), apellido: profile.apellido.trim(), telefono: profile.telefono.trim(),
        email: profile.email.trim().toLowerCase(), direccion: profile.direccion.trim(),
      })
      setProfile({ nombre: updated.nombre, apellido: updated.apellido, telefono: updated.telefono, email: updated.email, direccion: updated.direccion ?? '' })
      if (session) setSession({ ...session, customer: { id: updated.id, nombre: updated.nombre, apellido: updated.apellido, email: updated.email } })
      setMessage('Tus datos se actualizaron correctamente.')
    } catch (cause) { setError(apiError(cause, 'No pudimos actualizar tus datos.')) }
    finally { setSaving(false) }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault(); setMessage(''); setError('')
    if (passwords.nueva.length < 8) { setError('La nueva contraseña debe tener al menos 8 caracteres.'); return }
    if (passwords.nueva !== passwords.confirmar) { setError('La confirmación no coincide con la nueva contraseña.'); return }
    setPasswordBusy(true)
    try {
      await changeClientPassword(passwords.actual, passwords.nueva)
      setPasswords({ actual: '', nueva: '', confirmar: '' })
      setMessage('Tu contraseña fue actualizada.')
    } catch (cause) { setError(apiError(cause, 'No pudimos cambiar tu contraseña.')) }
    finally { setPasswordBusy(false) }
  }

  async function selectPhoto(file?: File) {
    if (!file) return
    setMessage(''); setError('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Selecciona una imagen JPEG, PNG o WebP de hasta 2 MB.'); return
    }
    setPhotoBusy(true)
    try { await uploadClientProfilePhoto(file); setMessage('Tu foto de perfil fue actualizada.'); setReloadKey((key) => key + 1) }
    catch (cause) { setError(apiError(cause, 'No pudimos actualizar tu foto.')) }
    finally { setPhotoBusy(false); if (fileInput.current) fileInput.current.value = '' }
  }

  async function removePhoto() {
    setPhotoBusy(true); setMessage(''); setError('')
    try { await deleteClientProfilePhoto(); setHasPhoto(false); setPhotoUrl(''); setMessage('Tu foto de perfil fue eliminada.') }
    catch (cause) { setError(apiError(cause, 'No pudimos eliminar tu foto.')) }
    finally { setPhotoBusy(false) }
  }

  if (status === 'loading') return <OrdersLoading label="Cargando tu perfil…" />
  if (status === 'error') return <OrdersError message="No pudimos cargar tu perfil." retry={() => setReloadKey((key) => key + 1)} />
  const initials = `${profile.nombre.charAt(0)}${profile.apellido.charAt(0)}`.toUpperCase() || 'C'

  return <section className="profile-page" aria-labelledby="profile-title">
    <div className="page-heading"><h1 id="profile-title">Mi perfil</h1><p>Administra tus datos personales y la seguridad de tu cuenta.</p></div>
    {message && <div className="form-message form-message-success" role="status">{message}</div>}
    {error && <div className="form-message form-message-error" role="alert">{error}</div>}

    <Card className="profile-photo-card">
      <div className="profile-photo">{photoUrl ? <img src={photoUrl} alt="Foto de perfil"/> : <span>{initials}</span>}</div>
      <div><h2>Foto de perfil</h2><p>JPEG, PNG o WebP. Tamaño máximo: 2 MB.</p><div className="profile-actions">
        <button className="button button-secondary" type="button" disabled={photoBusy} onClick={() => fileInput.current?.click()}><Camera size={17}/>{hasPhoto ? 'Cambiar foto' : 'Agregar foto'}</button>
        {hasPhoto && <button className="button profile-delete" type="button" disabled={photoBusy} onClick={() => void removePhoto()}><Trash2 size={17}/>Eliminar</button>}
        <input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void selectPhoto(event.target.files?.[0])}/>
      </div></div>
    </Card>

    <div className="profile-grid">
      <Card className="profile-section"><h2><UserRound size={20}/>Datos personales</h2><form onSubmit={saveProfile} className="profile-form">
        <label>Nombre<input value={profile.nombre} onChange={(e) => updateField('nombre', e.target.value)} maxLength={100}/></label>
        <label>Apellido<input value={profile.apellido} onChange={(e) => updateField('apellido', e.target.value)} maxLength={100}/></label>
        <label>Teléfono<input value={profile.telefono} onChange={(e) => updateField('telefono', e.target.value)} maxLength={20}/></label>
        <label>Correo electrónico<input type="email" value={profile.email} onChange={(e) => updateField('email', e.target.value)} maxLength={150}/></label>
        <label className="profile-wide">Dirección<input value={profile.direccion} onChange={(e) => updateField('direccion', e.target.value)} maxLength={255}/></label>
        <button className="button profile-submit profile-wide" type="submit" disabled={saving}><Save size={17}/>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
      </form></Card>

      <Card className="profile-section"><h2><KeyRound size={20}/>Cambiar contraseña</h2><form onSubmit={changePassword} className="profile-form password-form">
        <label>Contraseña actual<input type="password" autoComplete="current-password" value={passwords.actual} onChange={(e) => setPasswords((p) => ({ ...p, actual: e.target.value }))}/></label>
        <label>Nueva contraseña<input type="password" autoComplete="new-password" value={passwords.nueva} onChange={(e) => setPasswords((p) => ({ ...p, nueva: e.target.value }))}/></label>
        <label>Confirmar nueva contraseña<input type="password" autoComplete="new-password" value={passwords.confirmar} onChange={(e) => setPasswords((p) => ({ ...p, confirmar: e.target.value }))}/></label>
        <button className="button profile-submit" type="submit" disabled={passwordBusy}>{passwordBusy ? 'Actualizando…' : 'Actualizar contraseña'}</button>
      </form></Card>
    </div>
  </section>
}
