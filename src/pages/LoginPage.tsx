import { LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <Link to="/" className="logo-link" aria-label="SeLava, volver al sitio público"><Logo /></Link>
        <div className="login-icon" aria-hidden="true"><LogIn size={24} /></div>
        <h1 id="login-title">Acceso de clientes</h1>
        <p>El inicio de sesión estará disponible próximamente. Mientras tanto, puedes consultar nuestros servicios y precios.</p>
        <Link className="button" to="/">Volver al sitio público</Link>
      </section>
    </main>
  )
}
