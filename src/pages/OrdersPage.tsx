import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bubbles, EmptyHanger, HistoryFilters, NoMatches, PageHeading, Pager, PortalError, PortalLoading, SectionHeader, delay } from '../components/portal/PortalBits'
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, PhoneIcon, ShirtIcon } from '../components/portal/icons'
import { useOrderFlow } from '../hooks/useOrderFlow'
import { useOwnGarmentTypes, useOwnOrders } from '../hooks/useOwnOrders'
import type { OwnOrderSummary, OwnOrdersParams } from '../types/order'
import { orderCode } from '../utils/format'
import { EMPTY_HISTORY_FILTERS, SELAVA_PHONE, SELAVA_PHONE_HREF, countdown, currentStageIndex, formatLongDate, formatShortDate, garmentsText, hasHistoryFilters, historyRangeError, isOrderCancelled, isOrderInProcess, money, orderAmounts, sortedStages, type HistoryFilterValue } from '../utils/portal'

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
  const active = isOrderInProcess(order)
  const cancelled = isOrderCancelled(order)
  const { balance } = orderAmounts(order)
  const garments = garmentsText(order)
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
              <p>Recibido el {formatShortDate(order.fecha_recibido)}{garments ? ` · ${garments}` : ''}</p>
            </div>
          </div>
          <span className={`cp-chip${active ? '' : cancelled ? ' off' : ' ok'}`} role="status" aria-label={`Estado actual: ${order.estado_actual.nombre}`}><span className="cp-dot" />{order.estado_actual.nombre}</span>
        </div>

        <dl className="cp-meta">
          <div><dt>{active ? 'Entrega estimada' : 'Recibido'}</dt><dd>{formatShortDate(active ? order.fecha_entrega_estimada : order.fecha_recibido)}</dd></div>
          <div><dt>Total</dt><dd>{money(order.total)}</dd></div>
          <div><dt>Saldo</dt><dd className={!cancelled && balance > 0.004 ? 'cp-owed' : undefined}>{cancelled ? '—' : balance > 0.004 ? money(balance) : 'Pagado'}</dd></div>
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

const HISTORY_LIMIT = 8

export function OrdersPage() {
  const active = useOwnOrders({ seccion: 'activos', limite: 100, orden: 'recientes' })
  const types = useOwnGarmentTypes()
  const [filters, setFilters] = useState<HistoryFilterValue>(EMPTY_HISTORY_FILTERS)
  const [page, setPage] = useState(1)
  const rangeError = historyRangeError(filters)
  const historyParams = useMemo<OwnOrdersParams | null>(() => rangeError ? null : {
    seccion: 'historial',
    orden: 'recientes',
    pagina: page,
    limite: HISTORY_LIMIT,
    ...(filters.desde ? { fecha_desde: filters.desde } : {}),
    ...(filters.hasta ? { fecha_hasta: filters.hasta } : {}),
    ...(filters.tipo ? { tipo_prenda_id: Number(filters.tipo) } : {}),
  }, [filters, page, rangeError])
  const history = useOwnOrders(historyParams)

  const changeFilters = (value: HistoryFilterValue) => { setFilters(value); setPage(1) }
  const clear = () => changeFilters(EMPTY_HISTORY_FILTERS)
  const summary = active.data?.resumen ?? history.data?.resumen
  const activeOrders = active.data?.pedidos ?? []
  const historyOrders = history.data?.pedidos ?? []
  const filtered = hasHistoryFilters(filters)
  const historyCount = summary?.historial ?? history.data?.total ?? 0
  // Se decide con el resumen del servidor (no depende de filtros) para no desmontar los filtros al limpiarlos.
  const noOrdersAtAll = summary ? summary.activos + summary.historial === 0 : active.status === 'ready' && history.status === 'ready' && activeOrders.length === 0 && !filtered && historyOrders.length === 0

  return (
    <div className="cp-main">
      <PageHeading title="Mis pedidos." lead="Tus pedidos en proceso primero y, abajo, el historial de los que ya finalizaron.">
        <div className="cp-st" style={{ ...delay(.24), display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="cp-stat dark"><p>Activos</p><strong className="cp-disp">{summary ? summary.activos : '–'}</strong></div>
          <div className="cp-stat light"><p>Total en pedidos</p><strong className="cp-disp">{summary ? money(summary.total_facturado) : '–'}</strong></div>
        </div>
      </PageHeading>

      {noOrdersAtAll ? (
        <EmptyHanger title="Aún no tienes pedidos." text="Cuando registremos tu primer pedido, aparecerá aquí con su estado y fecha estimada." />
      ) : (
        <>
          <section className="cp-sec" aria-labelledby="pedidos-activos">
            <SectionHeader id="pedidos-activos" title="Pedidos activos" count={active.status === 'ready' ? activeOrders.length : undefined} text="Pedidos que estamos lavando, secando, planchando o que esperan entrega." />
            {(active.status === 'loading' || active.status === 'idle') && <PortalLoading label="Cargando pedidos activos…" />}
            {active.status === 'error' && <PortalError title="No pudimos cargar tus pedidos activos." retry={active.retry} />}
            {active.status === 'ready' && activeOrders.length === 0 && (
              <div className="cp-empty cp-empty-sm cp-pop" role="status">
                <span className="cp-empty-check"><CheckIcon size={30} /></span>
                <h3 className="cp-disp">No tienes pedidos activos.</h3>
                <p>Cuando nos dejes ropa, verás aquí su avance.</p>
              </div>
            )}
            {active.status === 'ready' && activeOrders.length > 0 && (
              <div className="cp-list">{activeOrders.map((order, index) => <OrderTicket key={order.id} order={order} index={index} />)}</div>
            )}
          </section>

          <section className="cp-sec" aria-labelledby="historial-pedidos">
            <SectionHeader id="historial-pedidos" title="Historial de pedidos" count={summary ? historyCount : undefined} text="Pedidos finalizados o cancelados, del más reciente al más antiguo." />
            <HistoryFilters label="Filtrar historial de pedidos" value={filters} onChange={changeFilters} types={types} error={rangeError} />
            {history.status === 'loading' && !history.data && <PortalLoading label="Cargando historial…" />}
            {history.status === 'error' && <PortalError title="No pudimos cargar tu historial." retry={history.retry} />}
            {history.data && history.status !== 'error' && !rangeError && (
              <div className={`cp-list${history.status === 'loading' ? ' is-refreshing' : ''}`} aria-busy={history.status === 'loading'}>
                {historyOrders.map((order, index) => <OrderTicket key={order.id} order={order} index={index} />)}
                {historyOrders.length === 0 && (filtered
                  ? <NoMatches title="No hay pedidos con esos filtros." text="Prueba con otras fechas o tipo de prenda." onClear={clear} />
                  : <EmptyHanger title="Aún no tienes historial." text="Cuando un pedido finalice, pasará automáticamente a esta lista." />)}
                <Pager label="Páginas del historial de pedidos" page={page} total={history.data.total} limit={HISTORY_LIMIT} onPage={setPage} />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
