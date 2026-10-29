import { House, LogOut, ShoppingBag, UserRound, Wallet } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useClientSession } from '../store/session'
import { Logo } from './Logo'
import { NotificationCenter } from './NotificationCenter'

const navigation = [
  { to: '/inicio', label: 'Inicio', Icon: House },
  { to: '/mis-pedidos', label: 'Mis pedidos', Icon: ShoppingBag },
  { to: '/pagos', label: 'Pagos', Icon: Wallet },
  { to: '/mi-perfil', label: 'Mi perfil', Icon: UserRound },
]

export function ClientHeader() {
  const session = useClientSession((state) => state.session)
  const clearSession = useClientSession((state) => state.clearSession)
  const navigate = useNavigate()
  const fullName = [session?.customer.nombre, session?.customer.apellido].filter(Boolean).join(' ')
  const initials = fullName
    ? fullName.split(' ').slice(0, 2).map((part) => part.charAt(0)).join('')
    : session?.customer.email?.charAt(0).toUpperCase() ?? 'C'

  return (
    <header className="client-header">
      <div className="header-inner">
        <Link to="/inicio" className="logo-link" aria-label="SeLava, ir al inicio"><Logo /></Link>
        <nav aria-label="Navegación principal">
          {navigation.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={15} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        {session && (
          <div className="session-actions">
            <NotificationCenter />
            <Link to="/mi-perfil" className="avatar" aria-label={`Perfil de ${fullName || 'cliente'}`}>
              {initials}
            </Link>
            <button className="icon-button" aria-label="Cerrar sesión" onClick={() => { clearSession(); navigate('/login') }}>
              <LogOut size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
