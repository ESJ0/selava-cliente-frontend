import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

interface AuthShellProps {
  title: string
  description: string
  children: ReactNode
  wide?: boolean
}

export function AuthShell({ title, description, children, wide = false }: AuthShellProps) {
  return (
    <div className="auth-page">
      <a className="skip-link" href="#contenido-auth">Saltar al formulario</a>
      <main id="contenido-auth" className={`auth-card${wide ? ' auth-card-wide' : ''}`}>
        <Link to="/" className="logo-link auth-logo" aria-label="SeLava, volver al inicio"><Logo /></Link>
        <div className="auth-heading">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        <Link className="auth-back-link" to="/"><ArrowLeft size={16} aria-hidden="true" />Volver al inicio</Link>
      </main>
    </div>
  )
}
