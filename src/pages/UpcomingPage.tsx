import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '../components/portal/icons'

// Solo evita rutas rotas. Cada funcionalidad se implementara en su historia.
export function UpcomingPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="cp-main">
      <section className="cp-blank cp-st">
        <span className="cp-badge-soft">Próximamente</span>
        <h1 className="cp-disp">{title}</h1>
        <p><strong>Estamos preparando este espacio.</strong> {description}</p>
        <Link className="cp-btn-dark" to="/inicio"><ArrowLeftIcon size={16} />Volver al inicio</Link>
      </section>
    </div>
  )
}
