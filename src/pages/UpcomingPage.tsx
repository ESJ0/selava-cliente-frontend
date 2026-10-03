import { ArrowLeft } from 'lucide-react'
import { ButtonLink } from '../components/Button'
import { Card } from '../components/Card'

// Solo evita rutas rotas. Cada funcionalidad se implementara en su historia.
export function UpcomingPage({ title, description }: { title: string; description: string }) {
  return (
    <>
      <div className="page-heading"><h1>{title}</h1></div>
      <Card className="upcoming-card">
        <span className="upcoming-badge">Próximamente</span>
        <h2>Estamos preparando este espacio</h2>
        <p>{description}</p>
        <ButtonLink to="/inicio" className="button-secondary"><ArrowLeft size={16} aria-hidden="true" />Volver al inicio</ButtonLink>
      </Card>
    </>
  )
}
