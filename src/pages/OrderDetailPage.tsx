import { ArrowLeft, CalendarDays, Shirt, WalletCards } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOwnOrderDetail, getOwnOrderHistory } from '../api/orders'
import { Card } from '../components/Card'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { OrderTimeline } from '../components/OrderTimeline'
import { OrdersError, OrdersLoading } from '../components/OrdersState'
import type { OwnOrderDetail, OwnOrderHistoryEntry } from '../types/order'
import { formatCurrency, formatDate, orderCode } from '../utils/format'
import { formatAppliedMeasure, formatChargeRate } from '../utils/chargeMode'

export function OrderDetailPage() {
  const { pedidoID } = useParams()
  const orderId = Number(pedidoID)
  const [detail, setDetail] = useState<OwnOrderDetail | null>(null)
  const [history, setHistory] = useState<OwnOrderHistoryEntry[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    if (!Number.isInteger(orderId) || orderId <= 0) { setStatus('error'); return }
    const controller = new AbortController()
    setStatus('loading')
    Promise.all([getOwnOrderDetail(orderId, controller.signal), getOwnOrderHistory(orderId, controller.signal)])
      .then(([order, entries]) => { if (!controller.signal.aborted) { setDetail(order); setHistory(entries); setStatus('ready') } })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('error')
      })
    return () => controller.abort()
  }, [orderId, reloadKey])

  if (status === 'loading') return <OrdersLoading label="Cargando detalle del pedido…" />
  if (status === 'error' || !detail) return <OrdersError retry={retry} message="No pudimos cargar este pedido." />

  return (
    <section className="order-detail-page" aria-labelledby="order-detail-title">
      <Link to="/mis-pedidos" className="back-link"><ArrowLeft size={17} aria-hidden="true" />Volver a mis pedidos</Link>
      <div className="order-detail-heading">
        <div><span className="section-eyebrow">Pedido</span><h1 id="order-detail-title">{orderCode(detail.id)}</h1></div>
        <OrderStatusBadge status={detail.estado_actual.nombre} />
      </div>
      <Card className="order-summary-grid">
        <div><CalendarDays aria-hidden="true" /><span>Recibido<strong>{formatDate(detail.fecha_recibido)}</strong></span></div>
        <div><CalendarDays aria-hidden="true" /><span>Entrega estimada<strong>{formatDate(detail.fecha_entrega_estimada)}</strong></span></div>
        <div><WalletCards aria-hidden="true" /><span>Total<strong>{formatCurrency(detail.total)}</strong></span></div>
      </Card>

      <Card className="detail-section">
        <h2><Shirt size={20} aria-hidden="true" />Prendas y servicios</h2>
        {detail.prendas.length === 0 && <p className="empty-block">Este pedido no tiene prendas registradas.</p>}
        <div className="garments-list">
          {detail.prendas.map((garment) => (
            <article key={garment.id} className="garment-item">
              <div><h3>{garment.tipo_prenda?.nombre ?? `Prenda ${garment.id}`}</h3>{garment.color && <span>Color: {garment.color}</span>}</div>
              {garment.descripcion && <p>{garment.descripcion}</p>}
              <dl className="garment-pricing">
                <div><dt>Medida aplicada</dt><dd>{formatAppliedMeasure(garment.cantidad, garment.modalidad_cobro_aplicada ?? 'UNIDAD')}</dd></div>
                {garment.precio_aplicado != null && <div><dt>Precio aplicado</dt><dd>{formatChargeRate(garment.precio_aplicado, garment.modalidad_cobro_aplicada ?? 'UNIDAD')}</dd></div>}
                <div><dt>Subtotal</dt><dd>{garment.subtotal == null ? 'No disponible' : formatCurrency(garment.subtotal)}</dd></div>
              </dl>
              <ul>
                {garment.servicios.map((service) => <li key={service.id}><span>{service.servicio?.nombre ?? 'Servicio'}</span>{garment.precio_aplicado == null && <strong>{formatCurrency(service.precio_aplicado)}</strong>}</li>)}
              </ul>
            </article>
          ))}
        </div>
        {detail.observaciones && <div className="order-notes"><strong>Observaciones</strong><p>{detail.observaciones}</p></div>}
      </Card>

      <Card className="detail-section"><h2>Seguimiento del pedido</h2><OrderTimeline entries={history} /></Card>
    </section>
  )
}
