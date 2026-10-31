import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'

const links = [
  { href: '#precios', label: 'Precios' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#contacto', label: 'Contacto' },
]

export function PublicHeader() {
  return (
    <header className="sl-header">
      <nav className="sl-wrap sl-nav" aria-label="Navegación del sitio público">
        <a href="#inicio" className="sl-brand" aria-label="SeLava, inicio"><BrandMark /></a>
        <div className="sl-navlinks">
          {links.map(({ href, label }) => <a key={href} className="sl-navlink" href={href}>{label}</a>)}
        </div>
        <Link className="sl-login" to="/login">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
          Iniciar sesión
        </Link>
      </nav>
    </header>
  )
}
