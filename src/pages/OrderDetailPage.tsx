import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bubbles, DryCleanRail, PortalError, PortalLoading, StateChip, delay } from '../components/portal/PortalBits'
import { ArrowLeftIcon, BasketIcon, CheckIcon, ClockIcon, PhoneIcon, RugIcon, ShirtIcon, ServiceIcon, SpinnerIcon, TagIcon } from '../components/portal/icons'
import { useOrderTracking } from '../hooks/useOrderTracking'
import type { OrderGarment } from '../types/order'
import type { AppliedPromotion } from '../types/promotion'
import { chargeUnit, formatAppliedMeasure, type ChargeMode } from '../utils/chargeMode'
import { orderCode } from '../utils/format'
import { SELAVA_PHONE, SELAVA_PHONE_HREF, countdownText, formatDateTime, formatShortDate, money, sortedStages } from '../utils/portal'

const swatches: Record<string, string> = {
  blanco: '#FFFFFF', negro: '#0A2433', azul: '#2B6CB0', rojo: '#D64545', verde: '#2F855A', amarillo: '#FFC93C', gris: '#9DB3BE',
  cafe: '#8B5E3C', rosado: '#F2A7C3', rosa: '#F2A7C3', morado: '#7B5EA7', beige: '#E8D9BF', celeste: '#5BC3EC', naranja: '#E07A1F',
}

function swatch(color: string) {
  const key = color.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/\s+/)[0]
  return swatches[key] ?? '#DCE7EC'
}

function GarmentIcon({ mode }: { mode: ChargeMode }) {
  if (mode === 'LIBRA') return <BasketIcon size={30} />
  if (mode === 'METRO') return <RugIcon size={30} />
  return <ShirtIcon size={30} />
}

/** Ahorro según el desglose persistido: medida cubierta a precio normal menos el importe promocional. */
function promotionSavings(promotion: AppliedPromotion) {
  return Math.max(0, promotion.medida_cubierta * promotion.precio_normal_aplicado - promotion.subtotal_promocional)
}

function GarmentCard({ garment, promoted }: { garment: OrderGarment; promoted: boolean }) {
  const mode = garment.modalidad_cobro_aplicada ?? 'UNIDAD'
  const name = garment.tipo_prenda?.nombre ?? `Prenda ${garment.id}`
  return (
    <article className="cp-item">
      <div className="cp-item-head">
        <div className="cp-item-id">
          <span className="cp-basket"><GarmentIcon mode={mode} /></span>
          <div>
            <h3 className="cp-disp">{name}</h3>
            {garment.descripcion && <p>“{garment.descripcion}”</p>}
          </div>
        </div>
        {garment.color && <span className="cp-color"><span style={{ background: swatch(garment.color) }} />Color: {garment.color}</span>}
      </div>
      <dl className="cp-kv3">
        <div><dt>Medida aplicada</dt><dd>{formatAppliedMeasure(garment.cantidad, mode)}</dd></div>
        {garment.precio_aplicado != null && <div><dt>Precio aplicado</dt><dd>{money(garment.precio_aplicado)} <small>por {chargeUnit(mode)}</small></dd></div>}
        <div>
          <dt>{promoted ? 'Subtotal sin promoción' : 'Subtotal'}</dt>
          <dd className={promoted && garment.subtotal != null ? 'cp-strike' : undefined}>{garment.subtotal == null ? 'No disponible' : money(garment.subtotal)}</dd>
        </div>
      </dl>
      {promoted && <p className="cp-note-muted">Importe incluido en el desglose de promociones.</p>}
      {garment.servicios.length > 0 && (
        <div className="cp-svcs">
          {garment.servicios.map((service) => {
            const label = service.servicio?.nombre ?? 'Servicio'
            return (
              <span key={service.id} className="cp-svc">
                <ServiceIcon name={label} /><span>{label}</span>
                {garment.precio_aplicado == null && <strong>{money(service.precio_aplicado)}</strong>}
              </span>
            )
          })}
        </div>
      )}
    </article>
  )
}

function PromotionCard({ promotion }: { promotion: AppliedPromotion }) {
  const mode = promotion.modalidad_cobro_aplicada
  const measure = (value: number) => formatAppliedMeasure(value, mode)
  const savings = promotionSavings(promotion)
  const blocks = Math.min(promotion.aplicaciones, 12)
  return (
    <article className="cp-promo">
      <div className="cp-promo-head">
        <div>
          <h3 className="cp-disp">{promotion.nombre}</h3>
          <p>{promotion.tipo_prenda_nombre} · {measure(promotion.medida_requerida)} por {money(promotion.precio_promocional)}</p>
        </div>
        {savings > 0.004 && <span className="cp-save-chip cp-pop" style={delay(1)}>Ahorraste <strong>{money(savings)}</strong></span>}
      </div>
      {blocks > 0 && (
        <div aria-hidden="true">
          <div className="cp-blocks-head"><span>{promotion.aplicaciones} {promotion.aplicaciones === 1 ? 'aplicación' : 'aplicaciones'} × {measure(promotion.medida_requerida)}</span><span>{measure(promotion.medida_cubierta)} cubiertas</span></div>
          <div className="cp-blocks" style={{ '--n': blocks } as CSSProperties}>
            {Array.from({ length: blocks }, (_, index) => <span key={index} className="cp-blk" style={delay(0.6 + index * 0.12)}>{measure(promotion.medida_requerida)}</span>)}
          </div>
        </div>
      )}
      <dl className="cp-kv3" style={{ marginTop: 22 }}>
        <div><dt>Aplicaciones</dt><dd>{promotion.aplicaciones}</dd></div>
        <div><dt>Medida cubierta</dt><dd>{measure(promotion.medida_cubierta)}</dd></div>
        <div><dt>Importe promocional</dt><dd>{money(promotion.subtotal_promocional)}</dd></div>
        <div><dt>Sobrante</dt><dd>{`${measure(promotion.sobrante)} × ${money(promotion.precio_normal_aplicado)}`}</dd></div>
        <div><dt>Importe normal</dt><dd>{money(promotion.subtotal_normal)}</dd></div>
        <div><dt>Subtotal con promoción</dt><dd style={{ color: '#06709F' }}>{money(promotion.subtotal_total)}</dd></div>
      </dl>
    </article>
  )
}

export function OrderDetailPage() {
  const { pedidoID } = useParams()
  const orderId = Number(pedidoID)
  const { detail, history, status, refreshing, refreshError, retry, refresh } = useOrderTracking(orderId)

  if (status === 'loading') return <div className="cp-main cp-main-detail"><PortalLoading label="Cargando detalle del pedido…" /></div>
  if (status === 'error' || !detail) return <div className="cp-main cp-main-detail"><PortalError title="No pudimos cargar este pedido." retry={retry} /></div>

  const code = orderCode(detail.id)
  const stages = sortedStages(detail.flujo_operativo)
  const pct = Math.min(100, Math.max(0, Math.round(detail.flujo_operativo.progreso_porcentaje)))
  const promotions = detail.promociones_aplicadas ?? []
  const promotedIds = new Set(promotions.flatMap((promotion) => promotion.prenda_ids ?? []))

  return (
    <div className="cp-main cp-main-detail">
      <Link className="cp-bk cp-st" to="/mis-pedidos"><span className="cp-ba"><ArrowLeftIcon size={18} /></span>Volver a mis pedidos</Link>

      <section className="cp-st cp-hero" style={delay(.1)} aria-labelledby="order-detail-title">
        <Bubbles items={[{ right: '6%', size: 28 }, { right: '20%', size: 14, delay: 3 }, { right: '48%', size: 20, delay: 6 }]} />
        <div className="cp-active-head" style={{ gap: 24 }}>
          <div>
            <p className="cp-eyebrow-sky" style={{ letterSpacing: '0.16em' }}>Pedido</p>
            <h1 className="cp-disp" id="order-detail-title">{code}</h1>
          </div>
          <div className="cp-hero-side">
            <StateChip status={detail.estado_actual} style={delay(1.9)} />
            {stages.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="cp-ring" style={{ '--p': pct } as CSSProperties} role="img" aria-label={`Progreso del pedido ${pct}%`}><span className="cp-disp">{pct}%</span></div>
                <span style={{ fontSize: 14, color: '#A9C1CD' }}>{detail.flujo_operativo.cancelado ? <>Pedido<br />cancelado</> : <>Progreso<br />del pedido</>}</span>
              </div>
            )}
          </div>
        </div>

        {stages.length > 0 ? <DryCleanRail stages={stages} detailed /> : (
          <div className="cp-legacy" role="status" aria-label={`Estado actual del pedido histórico: ${detail.estado_actual.nombre}`}>
            <ClockIcon size={26} />
            <div><strong>{detail.estado_actual.nombre}</strong>Este pedido anterior no cuenta con el desglose completo de etapas.</div>
          </div>
        )}

        <dl className="cp-sum">
          <div><dt>Recibido</dt><dd>{formatShortDate(detail.fecha_recibido)}</dd></div>
          <div><dt>Entrega estimada</dt><dd>{formatShortDate(detail.fecha_entrega_estimada)}{detail.fecha_entrega_estimada && <span style={{ color: '#FFC93C' }}> · {countdownText(detail.fecha_entrega_estimada)}</span>}</dd></div>
          <div><dt>Total</dt><dd>{money(detail.total)}</dd></div>
        </dl>
      </section>

      {refreshing && <p className="cp-banner info" role="status"><SpinnerIcon className="cp-spin" size={16} />Actualizando estado…</p>}
      {refreshError && (
        <div className="cp-banner warn" role="alert">
          <span><strong>No pudimos actualizar el estado.</strong> Conservamos la última información disponible.</span>
          <button type="button" onClick={refresh}>Reintentar</button>
        </div>
      )}

      <div className="cp-cols">
        <div className="cp-col">
          <section className="cp-card cp-st" style={delay(.25)} aria-labelledby="garments-title">
            <div className="cp-hd"><span className="cp-hi"><ShirtIcon size={22} /></span><h2 className="cp-disp" id="garments-title">Prendas y servicios</h2></div>
            {detail.prendas.length === 0
              ? <p className="cp-muted">Este pedido no tiene prendas registradas.</p>
              : <div className="cp-items">{detail.prendas.map((garment) => <GarmentCard key={garment.id} garment={garment} promoted={promotedIds.has(garment.id)} />)}</div>}
            {detail.observaciones && <div className="cp-obs"><strong>Observaciones</strong><p>{detail.observaciones}</p></div>}
          </section>

          {promotions.length > 0 && (
            <section className="cp-card cp-st" style={delay(.35)} aria-labelledby="promotions-title">
              <div className="cp-hd"><span className="cp-hi gold"><TagIcon size={22} /></span><h2 className="cp-disp" id="promotions-title">Promociones aplicadas</h2></div>
              <div className="cp-items">{promotions.map((promotion) => <PromotionCard key={promotion.promocion_id} promotion={promotion} />)}</div>
            </section>
          )}
        </div>

        <div className="cp-col">
          <section className="cp-receipt cp-st" style={delay(.3)} aria-label="Resumen de pago">
            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, letterSpacing: '.18em', color: '#5A7280', textAlign: 'center' }}>RESUMEN DE PAGO</p>
            <p className="cp-disp" style={{ margin: '0 0 18px', textAlign: 'center', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Se<span style={{ color: '#06709F' }}>Lava</span></p>
            {detail.prendas.map((garment) => (
              <div key={garment.id} className="cp-rl">
                <span>{garment.tipo_prenda?.nombre ?? `Prenda ${garment.id}`} · {formatAppliedMeasure(garment.cantidad, garment.modalidad_cobro_aplicada ?? 'UNIDAD')}</span>
                <span>{garment.subtotal == null ? '—' : money(garment.subtotal)}</span>
              </div>
            ))}
            {promotions.filter((promotion) => promotionSavings(promotion) > 0.004).map((promotion) => (
              <div key={promotion.promocion_id} className="cp-rl" style={{ color: '#06709F' }}><span>Promoción {promotion.nombre}</span><span>− {money(promotionSavings(promotion))}</span></div>
            ))}
            <div className="cp-rl" style={{ borderTop: '1.5px dashed #C9D8DF', marginTop: 8, paddingTop: 14 }}>
              <span className="cp-disp" style={{ fontSize: 20, fontWeight: 800 }}>Total</span>
              <span className="cp-disp" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>{money(detail.total)}</span>
            </div>
            <div className="cp-barcode" aria-hidden="true" />
            <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 12, letterSpacing: '.2em', color: '#5A7280' }}>{code}</p>
          </section>

          <section className="cp-card cp-st" style={delay(.4)} aria-labelledby="history-title">
            <div className="cp-hd"><span className="cp-hi"><ClockIcon size={22} /></span><h2 className="cp-disp" id="history-title">Historial de cambios</h2></div>
            {history.length === 0 ? <p className="cp-muted">Todavía no hay cambios de estado registrados.</p> : (
              <ol className="cp-hist" aria-label="Historial de estados">
                {history.map((entry, index) => (
                  <li key={entry.id} className="cp-hs" style={delay(0.5 + Math.min(index, 8) * 0.12)}>
                    <span className={`cp-hdot${index === history.length - 1 ? ' now' : ''}`}><CheckIcon size={14} /></span>
                    <div>
                      <p>{entry.estado.nombre}</p>
                      <time dateTime={entry.fecha_cambio}>{formatDateTime(entry.fecha_cambio)}</time>
                      {entry.observaciones && <p className="cp-hnote">{entry.observaciones}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <a className="cp-call2 cp-st" href={SELAVA_PHONE_HREF} style={delay(.5)}>
            <span><small>¿Dudas con este pedido?</small>Llamar al {SELAVA_PHONE}</span>
            <span className="cp-ca"><PhoneIcon size={20} /></span>
          </a>
        </div>
      </div>
    </div>
  )
}
