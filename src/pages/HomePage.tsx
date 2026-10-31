import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnOrders } from '../api/orders'
import { loadOrderDetail } from '../hooks/useOrderFlow'
import { Bubbles, DryCleanRail, PageHeading, StateChip, delay } from '../components/portal/PortalBits'
import { ArrowRightIcon, BagIcon, CardIcon, SparkIcon, SpinnerIcon, UserIcon } from '../components/portal/icons'
import { useClientSession } from '../store/session'
import type { OwnOrderDetail, OwnOrderSummary } from '../types/order'
import { isActiveOrder, orderCode } from '../utils/format'
import { SELAVA_PHONE, SELAVA_PHONE_HREF, countdown, formatLongDate, sortedStages } from '../utils/portal'

const ribbon = ['Lavado', 'Secado', 'Planchado', 'Dry clean', 'Tu ropa en buenas manos']

const tiles = [
  { to: '/mis-pedidos', title: 'Mis pedidos', text: 'Revisa el estado y el historial de tu ropa.', Icon: BagIcon },
  { to: '/pagos', title: 'Pagos', text: 'Consulta lo que has pagado y lo pendiente.', Icon: CardIcon },
  { to: '/mi-perfil', title: 'Mi perfil', text: 'Actualiza tus datos de contacto y contraseña.', Icon: UserIcon },
]

function ActiveOrderCard({ order, detail }: { order: OwnOrderSummary; detail: OwnOrderDetail | null }) {
  const stages = sortedStages(detail?.flujo_operativo)
  const due = countdown(order.fecha_entrega_estimada)
  return (
    <>
      <div className="cp-active-head">
        <div>
          <h2 className="cp-eyebrow-sky" id="active-order-title">Pedido activo</h2>
          <p className="cp-disp cp-active-code">{orderCode(order.id)}</p>
        </div>
        <StateChip status={detail?.estado_actual ?? order.estado_actual} style={delay(1.9)} />
      </div>
      {stages.length > 0 && <DryCleanRail stages={stages} />}
      <div className="cp-active-foot">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="cp-days">
            <strong className="cp-disp cp-pop" style={delay(1.2)}>{due.value}</strong>
            <span>{due.unit}</span>
          </div>
          <div>
            <p className="cp-due-label">Entrega estimada</p>
            <p className="cp-disp cp-due-date">{formatLongDate(order.fecha_entrega_estimada)}</p>
          </div>
        </div>
        <Link className="cp-lnk-light" to={`/mis-pedidos/${order.id}`}>Ver detalle<ArrowRightIcon size={18} /></Link>
      </div>
    </>
  )
}

export function HomePage() {
  const session = useClientSession((state) => state.session)
  const name = session?.customer.nombre
  const [orders, setOrders] = useState<OwnOrderSummary[]>([])
  const [detail, setDetail] = useState<OwnOrderDetail | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    if (!session) return
    const controller = new AbortController()
    setStatus('loading')
    setDetail(null)
    getOwnOrders({ limite: 100, orden: 'recientes' }, controller.signal)
      .then(({ pedidos }) => {
        setOrders(pedidos)
        setStatus('ready')
        const active = pedidos.find((pedido) => isActiveOrder(pedido.estado_actual.nombre))
        if (!active) return
        // El resumen no trae el flujo operativo; se consulta el detalle para dibujar el riel.
        void loadOrderDetail(active.id, controller.signal).then((order) => { if (order && !controller.signal.aborted) setDetail(order) })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && (error as { name?: string })?.name !== 'CanceledError') setStatus('error')
      })
    return () => controller.abort()
  }, [reloadKey, session])

  const activeOrders = orders.filter((order) => isActiveOrder(order.estado_actual.nombre))
  const activeOrder = activeOrders[0]

  return (
    <>
      <div className="cp-main cp-main-home">
        <PageHeading
          title={<>Hola, <span className="cp-hello">{name ? `${name}.` : 'de nuevo.'}<svg viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true"><path d="M2 10 C 25 2, 45 16, 70 8 S 115 2, 140 9 S 180 14, 198 6" fill="none" stroke="#FFC93C" strokeWidth="5" strokeLinecap="round" /></svg></span></>}
          lead="Así va tu ropa."
        >
          <div className="cp-st cp-count-pill" style={delay(.24)}>
            <span><BagIcon size={20} /></span>
            <span style={{ fontSize: 15 }}><strong className="cp-disp">{status === 'ready' ? activeOrders.length : '–'}</strong> {activeOrders.length === 1 ? 'pedido activo' : 'pedidos activos'}</span>
          </div>
        </PageHeading>

        <div className="cp-home-grid">
          <section className="cp-st cp-active" style={delay(.3)} aria-labelledby="active-order-title">
            <Bubbles items={[{ right: '8%', size: 26 }, { right: '22%', size: 14, delay: 3 }, { right: '40%', size: 20, delay: 6 }]} />
            {status === 'loading' && (
              <div className="cp-active-empty" role="status">
                <h2 className="cp-eyebrow-sky" id="active-order-title">Pedido activo</h2>
                <SpinnerIcon className="cp-spin" size={30} />Cargando pedido activo…
              </div>
            )}
            {status === 'error' && (
              <div className="cp-active-empty" role="alert">
                <h2 className="cp-eyebrow-sky" id="active-order-title">Pedido activo</h2>
                <p>No pudimos cargar tu pedido activo.</p>
                <button className="cp-btn-dark" style={{ background: '#FFC93C', color: '#0A2433' }} type="button" onClick={retry}>Reintentar</button>
              </div>
            )}
            {status === 'ready' && !activeOrder && (
              <div className="cp-active-empty">
                <p className="cp-eyebrow-sky" id="active-order-title">Pedido activo</p>
                <svg className="cp-swing" width="96" height="90" viewBox="0 0 76 70" aria-hidden="true">
                  <path d="M38 2 a6 6 0 1 1 6 6 c-3 0-6 2-6 6 v4" fill="none" stroke="#5BC3EC" strokeWidth="3" strokeLinecap="round" />
                  <path d="M38 18 L4 46 H72 Z" fill="none" stroke="#5BC3EC" strokeWidth="3" strokeLinejoin="round" />
                </svg>
                <h2 className="cp-disp">No tienes pedidos activos.</h2>
                <p>Aquí encontrarás el estado y la entrega estimada de tus próximos pedidos.</p>
              </div>
            )}
            {status === 'ready' && activeOrder && <ActiveOrderCard order={activeOrder} detail={detail?.id === activeOrder.id ? detail : null} />}
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section className="cp-st cp-promo-card" style={delay(.4)}>
              <SparkIcon />
              <div style={{ position: 'relative' }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>SeLava · Lavandería y Dry Clean</p>
                <h2 className="cp-disp">Tu ropa limpia, cuidada y lista cuando la necesitas.</h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>Más tiempo para ti, frescura para cada día.</p>
              </div>
              <Link className="cp-cta" to="/mis-pedidos">Ver mis pedidos<span className="cp-c"><ArrowRightIcon size={18} strokeWidth={2.2} /></span></Link>
            </section>
            <section className="cp-st cp-help" style={delay(.5)}>
              <p className="cp-label-muted">¿Dudas con tu pedido?</p>
              <a href={SELAVA_PHONE_HREF} className="cp-disp cp-help-phone">{SELAVA_PHONE}</a>
              <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.55, color: '#3E5866' }}>Lun a vie 09:00–20:00 · Sáb y dom 10:00–18:00</p>
            </section>
          </div>
        </div>

        <nav className="cp-tiles" aria-label="Accesos rápidos">
          {tiles.map(({ to, title, text, Icon }, index) => (
            <Link key={to} className="cp-tile cp-st" to={to} style={delay(.55 + index * .07)} aria-label={`${title}: ${text}`}>
              <div className="cp-tile-top">
                <span className="cp-ic"><Icon size={26} strokeWidth={1.8} /></span>
                <span className="cp-go"><ArrowRightIcon size={18} /></span>
              </div>
              <div><h2 className="cp-disp">{title}</h2><p>{text}</p></div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="cp-ribbon" aria-hidden="true">
        <div className="cp-marq cp-disp">
          {[0, 1].map((copy) => <span key={copy}>{ribbon.map((item) => <Fragment key={item}>{item} <i>✦</i></Fragment>)}</span>)}
        </div>
      </div>
    </>
  )
}
