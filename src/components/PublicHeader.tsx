import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { PublicIcon } from './PublicIcon'

const links = [
  { to: '/precios', label: 'Precios' },
  { to: '/promociones', label: 'Promociones' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

export function PublicHeader() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  // Cierra el menú del celular al cambiar de página.
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className={`sl-header${open ? ' is-open' : ''}`}>
      <nav className="sl-wrap sl-nav" aria-label="Navegación del sitio">
        <Link to="/" className="sl-brand" aria-label="SeLava, inicio"><BrandMark /></Link>
        <div className="sl-navlinks" id="sl-menu">
          {links.map(({ to, label }) => <NavLink key={to} className="sl-navlink" to={to}>{label}</NavLink>)}
          <Link className="sl-login sl-login-menu" to="/login"><PublicIcon name="user" size={18} />Iniciar sesión</Link>
        </div>
        <Link className="sl-login" to="/login"><PublicIcon name="user" size={18} />Iniciar sesión</Link>
        <button className="sl-burger" type="button" aria-expanded={open} aria-controls="sl-menu" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen((value) => !value)}>
          <PublicIcon name={open ? 'close' : 'menu'} size={22} width={2} />
        </button>
      </nav>
    </header>
  )
}
