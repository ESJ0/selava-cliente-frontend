import { ArrowRight, LoaderCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnOrders } from '../api/orders'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { HomeHero } from '../components/HomeHero'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { useClientSession } from '../store/session'
import type { OwnOrderSummary } from '../types/order'
import { formatDate, isActiveOrder, orderCode } from '../utils/format'

export function HomePage() {
  const session = useClientSession((state) => state.session)
  const greeting = session?.customer.nombre ? `Hola, ${session.customer.nombre}` : session ? 'Hola de nuevo' : 'Bienvenido a SeLava'
  const [activeOrder, setActiveOrder] = useState<OwnOrderSummary | null>(null)
  const [orderStatus, setOrderStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    if (!session) return
    const controller = new AbortController()
    setOrderStatus('loading')
    getOwnOrders({ limite: 100, orden: 'recientes' }, controller.signal)
      .then(({ pedidos }) => {
        setActiveOrder(pedidos.find((pedido) => isActiveOrder(pedido.estado_actual.nombre)) ?? null)
        setOrderStatus('ready')
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setOrderStatus('error')
      })
    return () => controller.abort()
  }, [reloadKey, session])
  return (
    <div className="home-page">
      <div className="page-heading">
        <h1>{greeting} <span aria-hidden="true">👋</span></h1>
        <p>{session ? 'Así va tu ropa.' : 'Cuidamos tu ropa, tú disfrutas tu día.'}</p>
      </div>
      <HomeHero hasSession={Boolean(session)} />
      <Card className="orders-card" aria-labelledby="orders-title">
        <h2 id="orders-title" className="section-eyebrow">Pedido activo</h2>
        {orderStatus === 'loading' && <div className="inline-state" role="status"><LoaderCircle className="state-spinner" aria-hidden="true" />Cargando pedido activo…</div>}
        {orderStatus === 'error' && <div className="inline-state error" role="alert"><p>No pudimos cargar tu pedido activo.</p><Button className="button-secondary" onClick={retry}>Reintentar</Button></div>}
        {orderStatus === 'ready' && !activeOrder && <EmptyState title="No tienes pedidos activos.">Aquí encontrarás el estado y la entrega estimada de tus próximos pedidos.</EmptyState>}
        {orderStatus === 'ready' && activeOrder && (
          <div className="active-order">
            <div><strong>{orderCode(activeOrder.id)}</strong><OrderStatusBadge status={activeOrder.estado_actual.nombre} /></div>
            <p>Entrega estimada: <strong>{formatDate(activeOrder.fecha_entrega_estimada)}</strong></p>
            <Link to={`/mis-pedidos/${activeOrder.id}`}>Ver detalle <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        )}
      </Card>
    </div>
  )
}
