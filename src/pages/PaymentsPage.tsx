import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnOrderPayments } from '../api/payments'
import { Bubbles, HistoryFilters, NoMatches, PageHeading, Pager, PortalError, PortalLoading, SectionHeader, delay } from '../components/portal/PortalBits'
import { ArrowUpRightIcon, CashIcon, CheckIcon, ChevronDownIcon, CopyIcon, ReceiptIcon } from '../components/portal/icons'
import { useOwnGarmentTypes, useOwnOrders } from '../hooks/useOwnOrders'
import type { OwnOrderSummary, OwnOrdersParams } from '../types/order'
import type { OwnPayment } from '../types/payment'
import { orderCode } from '../utils/format'
import { EMPTY_HISTORY_FILTERS, PAYMENT_SITUATION_LABEL, SELAVA_PHONE, SELAVA_PHONE_HREF, formatDateTime, formatShortDate, garmentsText, hasHistoryFilters, historyRangeError, money, orderAmounts, paymentSituation, type HistoryFilterValue } from '../utils/portal'

const HISTORY_LIMIT = 8
const PAYMENT_STATES = {
  label: 'Estado del pedido',
  options: [
    { value: '', label: 'Todos los pagados' },
    { value: 'activos', label: 'Pagado · en proceso' },
    { value: 'historial', label: 'Pagado · finalizado' },
  ],
}

/** Avanza de 0 a 1 con la misma curva del diseño para animar las cifras del encabezado. */
function useCountUp(run: boolean) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!run) return
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setProgress(1); return }
    let frame = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start - 400) / 1400))
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [run])
  return progress
}

function PaymentRow({ payment, index, copied, onCopy }: { payment: OwnPayment; index: number; copied: boolean; onCopy: (reference: string) => void }) {
  return (
    <li className="cp-pay" style={delay(0.5 + index * 0.1)}>
      <span className="cp-cash"><CashIcon size={24} /></span>
      <div style={{ minWidth: 0 }}>
        <p>{payment.metodo_pago.nombre}</p>
        <time dateTime={payment.fecha_pago}>{formatDateTime(payment.fecha_pago)}</time>
      </div>
      {payment.referencia ? (
        <button className="cp-ref" type="button" onClick={() => onCopy(payment.referencia!)} aria-label={`Copiar referencia ${payment.referencia}`}>
          <small>Ref.</small> {payment.referencia}
          {copied ? <span className="cp-ok">Copiada</span> : <CopyIcon size={16} />}
        </button>
      ) : <span />}
      <p className="cp-disp cp-amt">+ {money(payment.monto)}</p>
    </li>
  )
}

/** Abonos del pedido: se consultan solo al abrir la tarjeta. */
function useOrderPayments(orderId: number, enabled: boolean) {
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; payments: OwnPayment[] }>({ status: 'idle', payments: [] })
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    setState((current) => current.status === 'ready' ? current : { status: 'loading', payments: [] })
    getOwnOrderPayments(orderId, controller.signal)
      .then((payments) => { if (!controller.signal.aborted) setState({ status: 'ready', payments: payments ?? [] }) })
      .catch(() => { if (!controller.signal.aborted) setState({ status: 'error', payments: [] }) })
    return () => controller.abort()
  }, [orderId, enabled])
  return state
}

function PaymentCard({ order, index, copied, onCopy }: { order: OwnOrderSummary; index: number; copied: string; onCopy: (reference: string) => void }) {
  const [open, setOpen] = useState(false)
  const payments = useOrderPayments(order.id, open)
  const code = orderCode(order.id)
  const { total, paid, balance, pct } = orderAmounts(order)
  const situation = paymentSituation(order)
  const due = situation === 'activo-saldo' || situation === 'finalizado-saldo'
  const garments = garmentsText(order)
  const listId = `abonos-${order.id}`
  return (
    <article className={`cp-pc cp-st${due ? '' : ' is-settled'}`} style={delay(.32 + Math.min(index, 6) * .05)} aria-labelledby={`pago-${order.id}`}>
      <div className="cp-pc-head">
        <div className="cp-pc-id">
          <span className="cp-ri"><ReceiptIcon size={26} /></span>
          <div>
            <p>Pedido · {formatShortDate(order.fecha_recibido)}</p>
            <h3 className="cp-disp" id={`pago-${order.id}`}>{code}</h3>
            {garments && <small className="cp-pc-garments">{garments}</small>}
          </div>
        </div>
        <div className="cp-pc-actions">
          <span className={`cp-chip${due ? '' : ' ok'}`}><span className="cp-dot" />{PAYMENT_SITUATION_LABEL[situation]}</span>
          <Link className="cp-vp" to={`/mis-pedidos/${order.id}`} aria-label={`Ver detalle de ${code}`}>Ver pedido <ArrowUpRightIcon size={16} /></Link>
        </div>
      </div>

      <div className="cp-bar" role="img" aria-label={`Pagado ${money(paid)} de ${money(total)}`}>
        <span className="cp-paid" style={{ width: `${pct}%` }} />
        {pct < 100 && <span className="cp-due" />}
      </div>
      <div className="cp-bar-legend"><span>{pct}% pagado</span><span>{100 - pct}% pendiente</span></div>

      <dl className="cp-tri">
        <div><dt>Total</dt><dd>{money(total)}</dd></div>
        <div><dt><span className="cp-sw" style={{ background: '#0E9BD6' }} />Pagado</dt><dd style={{ color: '#06709F' }}>{money(paid)}</dd></div>
        <div className={due ? 'cp-due-box' : undefined}><dt><span className="cp-sw cp-stripes" />Saldo pendiente</dt><dd>{money(balance)}</dd></div>
      </dl>

      <button className="cp-more" type="button" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((value) => !value)}>
        <span>{open ? 'Ocultar abonos' : 'Ver abonos'}</span>
        <ChevronDownIcon size={18} style={{ transform: `rotate(${open ? 180 : 0}deg)` }} />
      </button>
      {open && (
        <div id={listId}>
          {payments.status === 'loading' && <p className="cp-no-pays" role="status">Cargando abonos…</p>}
          {payments.status === 'error' && <p className="cp-no-pays" role="alert">No pudimos cargar los abonos de este pedido.</p>}
          {payments.status === 'ready' && (payments.payments.length === 0
            ? <p className="cp-no-pays">Aún no hay pagos registrados para este pedido.</p>
            : <ol className="cp-pays" aria-label={`Pagos de ${code}`}>{payments.payments.map((payment, row) => <PaymentRow key={payment.id} payment={payment} index={row} copied={copied === payment.referencia} onCopy={onCopy} />)}</ol>)}
        </div>
      )}
    </article>
  )
}

export function PaymentsPage() {
  const pending = useOwnOrders({ saldo: 'pendiente', orden: 'prioridad', limite: 100 })
  const types = useOwnGarmentTypes()
  const [filters, setFilters] = useState<HistoryFilterValue>(EMPTY_HISTORY_FILTERS)
  const [page, setPage] = useState(1)
  const [copied, setCopied] = useState('')
  const copyTimer = useRef<number | undefined>(undefined)
  const rangeError = historyRangeError(filters)
  const historyParams = useMemo<OwnOrdersParams | null>(() => rangeError ? null : {
    saldo: 'pagado',
    orden: 'recientes',
    pagina: page,
    limite: HISTORY_LIMIT,
    ...(filters.estado === 'activos' || filters.estado === 'historial' ? { seccion: filters.estado } : {}),
    ...(filters.desde ? { fecha_desde: filters.desde } : {}),
    ...(filters.hasta ? { fecha_hasta: filters.hasta } : {}),
    ...(filters.tipo ? { tipo_prenda_id: Number(filters.tipo) } : {}),
  }, [filters, page, rangeError])
  const history = useOwnOrders(historyParams)

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const copy = useCallback((reference: string) => {
    void navigator.clipboard?.writeText(reference).catch(() => undefined)
    setCopied(reference)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(''), 1800)
  }, [])

  const changeFilters = (value: HistoryFilterValue) => { setFilters(value); setPage(1) }
  const clear = () => changeFilters(EMPTY_HISTORY_FILTERS)
  const summary = pending.data?.resumen ?? history.data?.resumen
  const pendingOrders = pending.data?.pedidos ?? []
  const historyOrders = history.data?.pedidos ?? []
  const filtered = hasHistoryFilters(filters)
  const hasAnyOrder = summary ? summary.activos + summary.historial > 0 : pendingOrders.length > 0 || historyOrders.length > 0
  const eased = useCountUp(Boolean(summary) && hasAnyOrder)
  const billed = summary?.total_facturado ?? 0
  const paidTotal = summary?.total_pagado ?? 0
  const owed = summary?.saldo_pendiente ?? 0
  const withBalance = summary?.pedidos_con_saldo ?? pendingOrders.length
  const pctPaid = billed > 0 ? Math.min(100, Math.round((Math.min(paidTotal, billed) / billed) * 100)) : 0
  const firstLoad = pending.status === 'loading' && !pending.data

  return (
    <div className="cp-main">
      <PageHeading plain title="Mis pagos." lead="Primero lo que tienes pendiente; abajo, el historial de pedidos ya pagados." />

      {firstLoad && <PortalLoading label="Cargando pagos…" />}
      {pending.status === 'error' && !pending.data && <PortalError title="No pudimos cargar tus pagos." retry={pending.retry} />}
      {pending.data && !hasAnyOrder && (
        <div className="cp-empty cp-pop">
          <span className="cp-empty-check"><ReceiptIcon size={34} /></span>
          <h2 className="cp-disp">Aún no tienes pagos.</h2>
          <p>Cuando registremos un pedido y sus pagos, podrás consultarlos en este espacio.</p>
        </div>
      )}
      {pending.data && hasAnyOrder && (
        <>
          <section className="cp-pay-hero cp-st" style={delay(.22)} aria-label="Resumen de saldos">
            <Bubbles items={[{ left: '40%', size: 24 }, { left: '58%', size: 14, delay: 3 }]} />
            <div style={{ position: 'relative', minWidth: 0 }}>
              <p className="cp-eyebrow-sky" style={{ letterSpacing: '0.16em' }}>Saldo pendiente</p>
              <p className="cp-disp cp-big">{money(owed * eased)}</p>
              <p className="cp-sub">{withBalance === 0 ? 'Estás al día con todos tus pedidos.' : withBalance === 1 ? 'Corresponde a 1 pedido con saldo.' : `Repartido en ${withBalance} pedidos con saldo.`}</p>
              <dl className="cp-hstats">
                <div><dt>Total de pedidos</dt><dd>{money(billed * eased)}</dd></div>
                <div><dt>Pagado</dt><dd style={{ color: '#5BC3EC' }}>{money(paidTotal * eased)}</dd></div>
                <div><dt>Con saldo</dt><dd>{withBalance}</dd></div>
              </dl>
            </div>
            <div className="cp-meter" role="img" aria-label={`${pctPaid}% pagado`}>
              <div className="cp-tube">
                <div className="cp-liquid" style={{ height: `${pctPaid}%` }}>
                  <svg className="cp-w1" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20 Q 25 5 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20 V40 H0 Z" fill="#5BC3EC" /></svg>
                  <svg className="cp-w2" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20 Q 25 35 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20 V40 H0 Z" fill="#0E9BD6" /></svg>
                  <span className="cp-mb" style={{ left: '30%' }} />
                  <span className="cp-mb" style={{ left: '60%', animationDelay: '1.3s', width: 8, height: 8 }} />
                  <span className="cp-mb" style={{ left: '45%', animationDelay: '2.4s' }} />
                </div>
                <span className="cp-gloss" />
                <span className="cp-mark" style={{ bottom: '25%' }} /><span className="cp-mark" style={{ bottom: '50%' }} /><span className="cp-mark" style={{ bottom: '75%' }} />
              </div>
              <p className="cp-disp cp-meter-pct">{Math.round(pctPaid * eased)}%</p>
              <p>pagado</p>
            </div>
          </section>

          <section className="cp-sec" aria-labelledby="pagos-pendientes">
            <SectionHeader id="pagos-pendientes" title="Pagos pendientes" count={pendingOrders.length} text="Pedidos con saldo por pagar; primero los que siguen en proceso.">
              <a className="cp-lnk2" href={SELAVA_PHONE_HREF}>¿Dudas con un pago? <strong>{SELAVA_PHONE}</strong></a>
            </SectionHeader>
            {pending.status === 'error' && <PortalError title="No pudimos actualizar tus pagos pendientes." retry={pending.retry} />}
            {pendingOrders.length === 0 ? (
              <div className="cp-empty cp-empty-sm cp-pop" role="status">
                <span className="cp-empty-check"><CheckIcon size={30} strokeWidth={1.8} /></span>
                <h3 className="cp-disp">No tienes pagos pendientes.</h3>
                <p>¡Todo al día! No debes nada.</p>
              </div>
            ) : (
              <div className="cp-list" style={{ gap: 20 }}>
                {pendingOrders.map((order, index) => <PaymentCard key={order.id} order={order} index={index} copied={copied} onCopy={copy} />)}
              </div>
            )}
          </section>

          <section className="cp-sec" aria-labelledby="historial-pagos">
            <SectionHeader id="historial-pagos" title="Historial de pagos" count={history.data?.total} text="Pedidos totalmente pagados, del más reciente al más antiguo." />
            <HistoryFilters label="Filtrar historial de pagos" value={filters} onChange={changeFilters} types={types} states={PAYMENT_STATES} error={rangeError} />
            {history.status === 'loading' && !history.data && <PortalLoading label="Cargando historial de pagos…" />}
            {history.status === 'error' && <PortalError title="No pudimos cargar tu historial de pagos." retry={history.retry} />}
            {history.data && history.status !== 'error' && !rangeError && (
              <div className={`cp-list${history.status === 'loading' ? ' is-refreshing' : ''}`} style={{ gap: 20 }} aria-busy={history.status === 'loading'}>
                {historyOrders.map((order, index) => <PaymentCard key={order.id} order={order} index={index} copied={copied} onCopy={copy} />)}
                {historyOrders.length === 0 && (filtered
                  ? <NoMatches title="No hay pagos con esos filtros." text="Prueba con otras fechas, tipo de prenda o estado." onClear={clear} />
                  : (
                    <div className="cp-empty cp-empty-sm cp-pop" role="status">
                      <span className="cp-empty-check"><ReceiptIcon size={30} /></span>
                      <h3 className="cp-disp">Aún no tienes historial de pagos.</h3>
                      <p>Cuando termines de pagar un pedido, aparecerá aquí.</p>
                    </div>
                  ))}
                <Pager label="Páginas del historial de pagos" page={page} total={history.data.total} limit={HISTORY_LIMIT} onPage={setPage} />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
