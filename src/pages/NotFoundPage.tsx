import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="cp-main">
      <section className="cp-blank cp-st">
        <span className="cp-badge-soft">Error 404</span>
        <h1 className="cp-disp">No encontramos esta página</h1>
        <p>Vuelve al inicio para continuar.</p>
        <Link className="cp-btn-dark" to="/inicio">Ir al inicio</Link>
      </section>
    </div>
  )
}
