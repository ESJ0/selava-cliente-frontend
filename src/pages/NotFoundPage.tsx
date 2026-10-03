import { ButtonLink } from '../components/Button'
import { Card } from '../components/Card'

export function NotFoundPage() {
  return <Card className="upcoming-card"><h1>No encontramos esta página</h1><p>Vuelve al inicio para continuar.</p><ButtonLink to="/inicio">Ir al inicio</ButtonLink></Card>
}
