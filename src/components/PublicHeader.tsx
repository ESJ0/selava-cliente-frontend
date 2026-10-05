import { LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const links = [
  { href: '#servicios', label: 'Servicios y precios' },
  { href: '#nosotros', label: 'Sobre nosotros' },
  { href: '#contacto', label: 'Contacto' },
]

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <a href="#inicio" className="logo-link" aria-label="SeLava, volver al inicio"><Logo /></a>
        <nav className="public-navigation" aria-label="Navegación del sitio público">
          {links.map(({ href, label }) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <Link className="login-link" to="/login"><LogIn size={17} aria-hidden="true" />Iniciar sesión</Link>
      </div>
    </header>
  )
}
