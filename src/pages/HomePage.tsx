import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { HomeHero } from '../components/HomeHero'
import { useClientSession } from '../store/session'

export function HomePage() {
  const session = useClientSession((state) => state.session)
  return (
    <div className="home-page">
      <div className="page-heading">
        <h1>{session ? `Hola, ${session.customer.nombre}` : 'Bienvenido a SeLava'} <span aria-hidden="true">👋</span></h1>
        <p>{session ? 'Así va tu ropa.' : 'Cuidamos tu ropa, tú disfrutas tu día.'}</p>
      </div>
      <HomeHero hasSession={Boolean(session)} />
      <Card className="orders-card" aria-labelledby="orders-title">
        <h2 id="orders-title" className="section-eyebrow">Pedido activo</h2>
        <EmptyState title="No tienes pedidos activos.">
          Aquí encontrarás el estado y la entrega estimada de tus próximos pedidos.
        </EmptyState>
      </Card>
    </div>
  )
}
