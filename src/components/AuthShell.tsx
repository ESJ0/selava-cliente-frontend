import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { LoginPanel, RecoveryPanel, RegisterPanel } from './auth/AuthPanels'

const panels = { login: LoginPanel, register: RegisterPanel, recovery: RecoveryPanel }

interface AuthShellProps {
  panel: keyof typeof panels
  children: ReactNode
}

export function AuthShell({ panel, children }: AuthShellProps) {
  const Panel = panels[panel]
  const wide = panel === 'register'
  return (
    <div className={`sl-auth${wide ? ' sl-auth-reg' : ''}`}>
      <a className="skip-link" href="#contenido-auth">Saltar al formulario</a>
      <main className="sl-auth-main">
        <Link className="sl-brand sl-st" to="/" aria-label="SeLava, volver al inicio"><BrandMark /></Link>
        <div id="contenido-auth" className="sl-auth-body">
          <div className="sl-auth-content">{children}</div>
        </div>
        <Link className="sl-lnk sl-back sl-st" to="/" style={{ animationDelay: wide ? '.76s' : '.7s' }}>
          <svg className="sl-arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          Volver al inicio
        </Link>
      </main>
      <Panel />
    </div>
  )
}
