import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnOrders } from '../api/orders'
import { Bubbles, EmptyHanger, FilterTabs, PageHeading, PortalError, PortalLoading, delay } from '../components/portal/PortalBits'
import { ArrowRightIcon, ChevronDownIcon, PhoneIcon, SearchIcon, ShirtIcon } from '../components/portal/icons'
import { useOrderFlow } from '../hooks/useOrderFlow'
import type { OwnOrderSummary } from '../types/order'
import { isActiveOrder, orderCode } from '../utils/format'
import { SELAVA_PHONE, SELAVA_PHONE_HREF, countdown, currentStageIndex, formatLongDate, formatShortDate, money, sortedStages } from '../utils/portal'

const tabNames = ['Todos', 'Activos', 'Entregados']

function segmentColor(index: number, current: number) {
  if (index < current) return '#5BC3EC'
  if (index === current) return '#FFC93C'
  return '#E6EEF2'
}

function OrderTicket({ order, index }: { order: OwnOrderSummary; index: number }) {
  const [open, setOpen] = useState(false)
  const detail = useOrderFlow(order.id)
  const stages = sortedStages(detail?.flujo_operativo)
  const current = currentStageIndex(stages)
  const pct = detail ? Math.min(100, Math.max(0, Math.round(detail.flujo_operativo.progreso_porcentaje))) : null
  const active = isActiveOrder(order.estado_actual.nombre)
  const due = countdown(order.fecha_entrega_estimada)
  const code = orderCode(order.id)
  const detailId = `pedido-${order.id}-detalle`

  return (
    <article className="cp-tk cp-st" style={delay(.38 + Math.min(index, 6) * .05)} aria-labelledby={`pedido-${order.id}`}>
      <div className="cp-stub">
        <span className="cp-stub-label">TICKET</span>
        <span className="cp-disp cp-stub-code" aria-hidden="true">{code}</span>
        <span className="cp-code" aria-hidden="true" />
      </div>
      <div className="cp-perf" aria-hidden="true"><span /><span /></div>

      <div className="cp-tk-body">
        <div className="cp-tk-head">
          <div className="cp-tk-id">
            <span className="cp-garm"><ShirtIcon size={26} /></span>
            <div>
              <h2 className="cp-disp" id={`pedido-${order.id}`}>{code}</h2>
              <p>Recibido el {formatShortDate(order.fecha_recibido)}</p>
            </div>
          </div>
          <span className={`cp-chip${active ? '' : ' ok'}`} role="status" aria-label={`Estado actual: ${order.estado_actual.nombre}`}><span className="cp-dot" />{order.estado_actual.nombre}</span>
        </div>

        <dl className="cp-meta">
          <div><dt>Recibido</dt><dd>{formatShortDate(order.fecha_recibido)}</dd></div>
          <div><dt>Entrega estimada</dt><dd>{formatShortDate(order.fecha_entrega_estimada)}</dd></div>
          <div><dt>Total</dt><dd>{money(order.total)}</dd></div>
          <div>
            <dt>Progreso · {pct === null ? '—' : `${pct}%`}</dt>
            <dd className="cp-segs" aria-hidden="true">
              {(stages.length ? stages : [0, 1, 2, 3, 4]).map((stage, stageIndex) => (
                <span key={typeof stage === 'number' ? stage : stage.id} className="cp-sg" style={{ background: stages.length ? segmentColor(stageIndex, current) : '#E6EEF2', animationDelay: `${(0.5 + stageIndex * 0.1).toFixed(2)}s` }} />
              ))}
            </dd>
          </div>
        </dl>

        <button className="cp-more" type="button" aria-expanded={open} aria-controls={detailId} onClick={() => setOpen((value) => !value)}>
          <span>{open ? 'Ocultar detalle' : 'Ver detalle'}</span>
          <ChevronDownIcon size={18} style={{ transform: `rotate(${open ? 180 : 0}deg)` }} />
        </button>

        {open && (
          <div className="cp-detail" id={detailId}>
            {stages.length > 0 ? (
              <ol className="cp-steps" aria-label={`Etapas de ${code}`}>
                {stages.map((stage, stageIndex) => {
                  const done = stageIndex < current
                  const now = stageIndex === current
                  return (
                    <li key={stage.id} className="cp-tl" style={delay(stageIndex * .07)}>
                      <span className={`cp-d ${done ? 'done' : now ? 'now' : 'next'}`}>{done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A2433" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}</span>
                      <div>
                        <p style={{ color: stageIndex <= current ? '#0A2433' : '#5A7280' }}>{stage.nombre}</p>
                        <small>{done ? 'Completado' : now ? 'En proceso ahora' : 'Pendiente'}</small>
                      </div>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="cp-muted">{detail ? 'Este pedido no cuenta con el desglose de etapas.' : 'Cargando etapas…'}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="cp-ready">
                <Bubbles items={[{ right: '14%', size: 22 }, { right: '34%', size: 12, delay: 2.5 }]} />
                <p style={{ marginBottom: 6, fontSize: 13, color: '#A9C1CD' }}>{active ? 'Tu ropa estará lista en' : 'Estado del pedido'}</p>
                <p className="cp-disp cp-ready-n">{active ? <>{due.value} <span>{due.unit === 'entrega' ? '' : due.unit}</span></> : order.estado_actual.nombre}</p>
                <p style={{ marginTop: 10, fontSize: 15 }}>{formatLongDate(order.fecha_entrega_estimada)}</p>
              </div>
              <div className="cp-doubt">
                <div><p>¿Dudas con este pedido?</p><strong>Llámanos y menciona {code}</strong></div>
                <a className="cp-call" href={SELAVA_PHONE_HREF} aria-label={`Llamar al ${SELAVA_PHONE}`}><PhoneIcon size={20} />{SELAVA_PHONE}</a>
              </div>
            </div>
            <Link className="cp-full" to={`/mis-pedidos/${order.id}`}>
              <span><small>Prendas, promociones e historial</small>Ver pedido completo</span>
              <span className="cp-fa"><ArrowRightIcon size={20} strokeWidth={2.2} /></span>
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}

export function OrdersPage() {
  const [orders, setOrders] = useState<OwnOrderSummary[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [tab, setTab] = useState(0)
  const [query, setQuery] = useState('')
  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    getOwnOrders({ limite: 100, orden: 'recientes' }, controller.signal)
      .then((response) => { setOrders(response.pedidos); setStatus('ready') })
      .catch((error) => { if (error?.name !== 'CanceledError') setStatus('error') })
    return () => controller.abort()
  }, [reloadKey])

  const activeCount = orders.filter((order) => isActiveOrder(order.estado_actual.nombre)).length
  const counts = [orders.length, activeCount, orders.length - activeCount]
  const search = query.trim().toUpperCase().replace(/\s+/g, '')
  const visible = useMemo(() => orders
    .filter((order) => tab === 0 || (tab === 1) === isActiveOrder(order.estado_actual.nombre))
    .filter((order) => !search || orderCode(order.id).includes(search) || String(order.id) === search.replace(/^#/, '')), [orders, tab, search])

  return (
    <div className="cp-main">
      <PageHeading title="Mis pedidos." lead="Consulta el estado y los detalles de tus prendas.">
        <div className="cp-st" style={{ ...delay(.24), display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="cp-stat dark"><p>Activos</p><strong className="cp-disp">{status === 'ready' ? activeCount : '–'}</strong></div>
          <div className="cp-stat light"><p>Total en pedidos</p><strong className="cp-disp">{status === 'ready' ? money(orders.reduce((sum, order) => sum + order.total, 0)) : '–'}</strong></div>
        </div>
      </PageHeading>

      {status === 'loading' && <PortalLoading label="Cargando pedidos…" />}
      {status === 'error' && <PortalError title="No pudimos cargar tus pedidos." retry={retry} />}
      {status === 'ready' && orders.length === 0 && <EmptyHanger title="Aún no tienes pedidos." text="Cuando registremos tu primer pedido, aparecerá aquí con su estado y fecha estimada." />}
      {status === 'ready' && orders.length > 0 && (
        <>
          <div className="cp-st cp-toolbar" style={delay(.3)}>
            <FilterTabs label="Filtrar pedidos" tabs={tabNames.map((label, index) => ({ label, count: counts[index] }))} selected={tab} onSelect={setTab} />
            <label className="cp-search">
              <SearchIcon size={20} stroke="#5A7280" />
              <span className="cp-sr-only">Buscar pedido</span>
              <input type="search" placeholder="Buscar por código, ej. SLV-0015" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
          </div>
          <div className="cp-list">
            {visible.map((order, index) => <OrderTicket key={order.id} order={order} index={index} />)}
            {visible.length === 0 && (
              <EmptyHanger
                title={search ? 'No encontramos ese pedido' : tab === 2 ? 'Aún no tienes pedidos entregados' : 'No hay pedidos aquí'}
                text={search ? 'Revisa el código e intenta de nuevo.' : tab === 2 ? 'Cuando entreguemos tu ropa, aparecerá en esta lista.' : 'No tienes pedidos en proceso en este momento.'}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
