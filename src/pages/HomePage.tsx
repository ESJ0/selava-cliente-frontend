import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useOrderFlow } from '../hooks/useOrderFlow'
import { useOwnOrders } from '../hooks/useOwnOrders'
import { Bubbles, DryCleanRail, PageHeading, StateChip, delay } from '../components/portal/PortalBits'
import { ArrowRightIcon, BagIcon, CardIcon, SparkIcon, SpinnerIcon, UserIcon } from '../components/portal/icons'
import { useClientSession } from '../store/session'
import type { OwnOrderSummary } from '../types/order'
import { orderCode } from '../utils/format'
import { SELAVA_PHONE, SELAVA_PHONE_HREF, countdown, formatLongDate, formatShortDate, garmentsText, isOrderInProcess, money, orderAmounts, sortedStages } from '../utils/portal'

const ribbon = ['Lavado', 'Secado', 'Planchado', 'Dry clean', 'Tu ropa en buenas manos']

const tiles = [
  { to: '/mis-pedidos', title: 'Mis pedidos', text: 'Revisa el estado y el historial de tu ropa.', Icon: BagIcon },
  { to: '/pagos', title: 'Pagos', text: 'Consulta lo que has pagado y lo pendiente.', Icon: CardIcon },
  { to: '/mi-perfil', title: 'Mi perfil', text: 'Actualiza tus datos de contacto y contraseña.', Icon: UserIcon },
]

function ActiveOrderCard({ order, index }: { order: OwnOrderSummary; index: number }) {
  const detail = useOrderFlow(order.id)
  const stages = sortedStages(detail?.flujo_operativo)
  const due = countdown(order.fecha_entrega_estimada)
  const { total, balance } = orderAmounts(order)
  const code = orderCode(order.id)
  const garments = garmentsText(order)
  const titleId = `active-order-${order.id}`
  return (
    <article className="cp-st cp-active" style={delay(.3 + Math.min(index, 4) * .08)} aria-labelledby={titleId}>
      <Bubbles items={[{ right: '8%', size: 26 }, { right: '22%', size: 14, delay: 3 }, { right: '40%', size: 20, delay: 6 }]} />
      <div className="cp-active-head">
        <div>
          <p className="cp-eyebrow-sky">Pedido activo · recibido el {formatShortDate(order.fecha_recibido)}</p>
          <h2 className="cp-disp cp-active-code" id={titleId}>{code}</h2>
          {garments && <p className="cp-active-garments">{garments}</p>}
        </div>
        <StateChip status={detail?.estado_actual ?? order.estado_actual} style={delay(.6)} />
      </div>
      {stages.length > 0 && <DryCleanRail stages={stages} />}
      <dl className="cp-active-money">
        <div><dt>Total</dt><dd className="cp-disp">{money(total)}</dd></div>
        <div className={balance > 0.004 ? 'is-due' : 'is-paid'}>
          <dt>{balance > 0.004 ? 'Saldo pendiente' : 'Pagado'}</dt>
          <dd className="cp-disp">{balance > 0.004 ? money(balance) : 'Al día'}</dd>
        </div>
      </dl>
      <div className="cp-active-foot">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="cp-days">
            <strong className="cp-disp cp-pop" style={delay(.9)}>{due.value}</strong>
            <span>{due.unit}</span>
          </div>
          <div>
            <p className="cp-due-label">Entrega estimada</p>
            <p className="cp-disp cp-due-date">{formatLongDate(order.fecha_entrega_estimada)}</p>
          </div>
        </div>
        <Link className="cp-lnk-light" to={`/mis-pedidos/${order.id}`} aria-label={`Ver detalle de ${code}`}>Ver detalle<ArrowRightIcon size={18} /></Link>
      </div>
    </article>
  )
}

function ActiveState({ children, role }: { children: ReactNode; role?: string }) {
  return (
    <section className="cp-st cp-active" style={delay(.3)} aria-label="Pedidos activos" role={role}>
      <Bubbles items={[{ right: '8%', size: 26 }, { right: '22%', size: 14, delay: 3 }, { right: '40%', size: 20, delay: 6 }]} />
      <div className="cp-active-empty">{children}</div>
    </section>
  )
}

export function HomePage() {
  const session = useClientSession((state) => state.session)
  const name = session?.customer.nombre
  // Solo pedidos en proceso: al pasar a Finalizado (o Cancelado) dejan de aparecer en el Inicio.
  const { data, status, retry } = useOwnOrders(session ? { seccion: 'activos', limite: 100, orden: 'recientes' } : null)
  const activeOrders = status === 'ready' ? (data?.pedidos ?? []).filter(isOrderInProcess) : []
  const ready = status === 'ready'

  return (
    <>
      <div className="cp-main cp-main-home">
        <PageHeading
          title={<>Hola, <span className="cp-hello">{name ? `${name}.` : 'de nuevo.'}<svg viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true"><path d="M2 10 C 25 2, 45 16, 70 8 S 115 2, 140 9 S 180 14, 198 6" fill="none" stroke="#FFC93C" strokeWidth="5" strokeLinecap="round" /></svg></span></>}
          lead="Así va tu ropa."
        >
          <div className="cp-st cp-count-pill" style={delay(.24)}>
            <span><BagIcon size={20} /></span>
            <span style={{ fontSize: 15 }}><strong className="cp-disp">{ready ? activeOrders.length : '–'}</strong> {activeOrders.length === 1 ? 'pedido activo' : 'pedidos activos'}</span>
          </div>
        </PageHeading>

        <div className="cp-home-grid">
          <div className="cp-active-stack">
            {(status === 'loading' || status === 'idle') && (
              <ActiveState role="status">
                <p className="cp-eyebrow-sky">Pedidos activos</p>
                <SpinnerIcon className="cp-spin" size={30} />Cargando pedidos activos…
              </ActiveState>
            )}
            {status === 'error' && (
              <ActiveState role="alert">
                <p className="cp-eyebrow-sky">Pedidos activos</p>
                <p>No pudimos cargar tus pedidos activos.</p>
                <button className="cp-btn-dark" style={{ background: '#FFC93C', color: '#0A2433' }} type="button" onClick={retry}>Reintentar</button>
              </ActiveState>
            )}
            {ready && activeOrders.length === 0 && (
              <ActiveState>
                <p className="cp-eyebrow-sky">Pedidos activos</p>
                <svg className="cp-swing" width="96" height="90" viewBox="0 0 76 70" aria-hidden="true">
                  <path d="M38 2 a6 6 0 1 1 6 6 c-3 0-6 2-6 6 v4" fill="none" stroke="#5BC3EC" strokeWidth="3" strokeLinecap="round" />
                  <path d="M38 18 L4 46 H72 Z" fill="none" stroke="#5BC3EC" strokeWidth="3" strokeLinejoin="round" />
                </svg>
                <h2 className="cp-disp">No tienes pedidos activos.</h2>
                <p>Aquí encontrarás el estado y la entrega estimada de tus próximos pedidos.</p>
                <Link className="cp-lnk-light" to="/mis-pedidos">Ver historial de pedidos<ArrowRightIcon size={18} /></Link>
              </ActiveState>
            )}
            {ready && activeOrders.map((order, index) => <ActiveOrderCard key={order.id} order={order} index={index} />)}
          </div>

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
