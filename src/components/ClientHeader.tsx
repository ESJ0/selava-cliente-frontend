import { useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getClientProfile } from '../api/profile'
import { useClientSession } from '../store/session'
import { initialsOf } from '../utils/portal'
import { BrandMark } from './BrandMark'
import { NotificationCenter } from './NotificationCenter'
import { BagIcon, CardIcon, HomeIcon, LogoutIcon, UserIcon } from './portal/icons'

const navigation = [
  { to: '/inicio', label: 'Inicio', Icon: HomeIcon },
  { to: '/mis-pedidos', label: 'Mis pedidos', Icon: BagIcon },
  { to: '/pagos', label: 'Pagos', Icon: CardIcon },
  { to: '/mi-perfil', label: 'Mi perfil', Icon: UserIcon },
]

export function ClientHeader() {
  const session = useClientSession((state) => state.session)
  const setSession = useClientSession((state) => state.setSession)
  const clearSession = useClientSession((state) => state.clearSession)
  const navigate = useNavigate()
  const fullName = [session?.customer.nombre, session?.customer.apellido].filter(Boolean).join(' ')
  const initials = fullName ? initialsOf(fullName) : session?.customer.email?.charAt(0).toUpperCase() ?? 'C'
  const missingName = Boolean(session && !session.customer.nombre)

  // El login no expone el perfil: se completa el nombre real del cliente una sola vez.
  useEffect(() => {
    if (!missingName) return
    let active = true
    getClientProfile()
      .then((profile) => {
        const current = useClientSession.getState().session
        if (!active || !current) return
        setSession({ ...current, customer: { ...current.customer, nombre: profile.nombre, apellido: profile.apellido, email: profile.email } })
      })
      .catch(() => undefined)
    return () => { active = false }
  }, [missingName, setSession])

  return (
    <header className="cp-header">
      <div className="cp-nav">
        <Link to="/inicio" className="cp-brand" aria-label="SeLava, ir al inicio"><BrandMark /></Link>
        <nav className="cp-navs" aria-label="Navegación principal">
          {navigation.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `cp-nl${isActive ? ' on' : ''}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        {session && (
          <div className="cp-session">
            <NotificationCenter />
            <Link to="/mi-perfil" className="cp-avatar" aria-label={`Perfil de ${fullName || 'cliente'}`}>{initials}</Link>
            <button className="cp-ib" type="button" aria-label="Cerrar sesión" onClick={() => { clearSession(); navigate('/login') }}>
              <LogoutIcon size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
