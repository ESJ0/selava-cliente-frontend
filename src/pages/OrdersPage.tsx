import { ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnOrders } from '../api/orders'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { OrdersEmpty, OrdersError, OrdersLoading } from '../components/OrdersState'
import type { OwnOrderSummary } from '../types/order'
import { formatCurrency, formatDate, orderCode } from '../utils/format'

export function OrdersPage() {
  const [orders, setOrders] = useState<OwnOrderSummary[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    getOwnOrders({ limite: 100, orden: 'recientes' }, controller.signal)
      .then((response) => { setOrders(response.pedidos); setStatus('ready') })
      .catch((error) => { if (error?.name !== 'CanceledError') setStatus('error') })
    return () => controller.abort()
  }, [reloadKey])

  return (
    <section className="orders-page" aria-labelledby="orders-page-title">
      <div className="page-heading"><h1 id="orders-page-title">Mis pedidos</h1><p>Consulta el estado y los detalles de tus prendas.</p></div>
      {status === 'loading' && <OrdersLoading />}
      {status === 'error' && <OrdersError retry={retry} />}
      {status === 'ready' && orders.length === 0 && <OrdersEmpty />}
      {status === 'ready' && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <Link className="order-card" to={`/mis-pedidos/${order.id}`} key={order.id} aria-label={`Ver pedido ${orderCode(order.id)}`}>
              <div><span className="order-code">{orderCode(order.id)}</span><OrderStatusBadge status={order.estado_actual.nombre} /></div>
              <dl>
                <div><dt>Recibido</dt><dd>{formatDate(order.fecha_recibido)}</dd></div>
                <div><dt>Entrega estimada</dt><dd>{formatDate(order.fecha_entrega_estimada)}</dd></div>
                <div><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div>
              </dl>
              <ChevronRight className="order-chevron" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
