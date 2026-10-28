import { AlertCircle, ArrowLeft, CalendarDays, RefreshCw, Shirt, WalletCards } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { AppliedPromotions } from '../components/AppliedPromotions'
import { Button } from '../components/Button'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { OrderProgress } from '../components/OrderProgress'
import { OrderTimeline } from '../components/OrderTimeline'
import { OrdersError, OrdersLoading } from '../components/OrdersState'
import { useOrderTracking } from '../hooks/useOrderTracking'
import { formatCurrency, formatDate, orderCode } from '../utils/format'
import { formatAppliedMeasure, formatChargeRate } from '../utils/chargeMode'

export function OrderDetailPage() {
  const { pedidoID } = useParams()
  const orderId = Number(pedidoID)
  const { detail, history, status, refreshing, refreshError, retry, refresh } = useOrderTracking(orderId)

  if (status === 'loading') return <OrdersLoading label="Cargando detalle del pedido…" />
  if (status === 'error' || !detail) return <OrdersError retry={retry} message="No pudimos cargar este pedido." />

  return (
    <section className="order-detail-page" aria-labelledby="order-detail-title">
      <Link to="/mis-pedidos" className="back-link"><ArrowLeft size={17} aria-hidden="true" />Volver a mis pedidos</Link>
      <div className="order-detail-heading">
        <div><span className="section-eyebrow">Pedido</span><h1 id="order-detail-title">{orderCode(detail.id)}</h1></div>
        <OrderStatusBadge status={detail.estado_actual.nombre} />
      </div>
      {refreshing && <p className="tracking-refreshing" role="status"><RefreshCw className="state-spinner" size={16} aria-hidden="true" />Actualizando estado…</p>}
      {refreshError && (
        <div className="tracking-refresh-error" role="alert">
          <AlertCircle size={19} aria-hidden="true" />
          <span><strong>No pudimos actualizar el estado.</strong> Conservamos la última información disponible.</span>
          <Button className="button-secondary" onClick={refresh}>Reintentar</Button>
        </div>
      )}
      <Card className="order-summary-grid">
        <div><CalendarDays aria-hidden="true" /><span>Recibido<strong>{formatDate(detail.fecha_recibido)}</strong></span></div>
        <div><CalendarDays aria-hidden="true" /><span>Entrega estimada<strong>{formatDate(detail.fecha_entrega_estimada)}</strong></span></div>
        <div><WalletCards aria-hidden="true" /><span>Total<strong>{formatCurrency(detail.total)}</strong></span></div>
      </Card>

      <Card className="detail-section">
        <h2><Shirt size={20} aria-hidden="true" />Prendas y servicios</h2>
        {detail.prendas.length === 0 && <p className="empty-block">Este pedido no tiene prendas registradas.</p>}
        <div className="garments-list">
          {detail.prendas.map((garment) => {
            const hasPromotion = detail.promociones_aplicadas?.some(p => p.prenda_ids?.includes(garment.id)) ?? false
            return (
            <article key={garment.id} className="garment-item">
              <div><h3>{garment.tipo_prenda?.nombre ?? `Prenda ${garment.id}`}</h3>{garment.color && <span>Color: {garment.color}</span>}</div>
              {garment.descripcion && <p>{garment.descripcion}</p>}
              <dl className="garment-pricing">
                <div><dt>Medida aplicada</dt><dd>{formatAppliedMeasure(garment.cantidad, garment.modalidad_cobro_aplicada ?? 'UNIDAD')}</dd></div>
                {garment.precio_aplicado != null && <div><dt>Precio aplicado</dt><dd>{formatChargeRate(garment.precio_aplicado, garment.modalidad_cobro_aplicada ?? 'UNIDAD')}</dd></div>}
                <div><dt>{hasPromotion ? 'Subtotal sin promoción' : 'Subtotal'}</dt><dd>{garment.subtotal == null ? 'No disponible' : formatCurrency(garment.subtotal)}</dd></div>
              </dl>
              {hasPromotion && <p>Importe incluido en el desglose de promociones.</p>}
              <ul>
                {garment.servicios.map((service) => <li key={service.id}><span>{service.servicio?.nombre ?? 'Servicio'}</span>{garment.precio_aplicado == null && <strong>{formatCurrency(service.precio_aplicado)}</strong>}</li>)}
              </ul>
            </article>
            )
          })}
        </div>
        {!!detail.promociones_aplicadas?.length && <AppliedPromotions promotions={detail.promociones_aplicadas} />}
        {detail.observaciones && <div className="order-notes"><strong>Observaciones</strong><p>{detail.observaciones}</p></div>}
      </Card>

      <Card className="detail-section">
        <h2>Seguimiento del pedido</h2>
        <OrderProgress flow={detail.flujo_operativo} currentStatus={detail.estado_actual} />
        <div className="order-history-section">
          <h3>Historial de cambios</h3>
          <OrderTimeline entries={history} />
        </div>
      </Card>
    </section>
  )
}
