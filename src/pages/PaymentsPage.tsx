import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnOrders } from '../api/orders'
import { getOwnOrderBalance, getOwnOrderPayments } from '../api/payments'
import { Bubbles, FilterTabs, PageHeading, PortalError, PortalLoading, delay } from '../components/portal/PortalBits'
import { ArrowUpRightIcon, CashIcon, CheckIcon, CopyIcon, ReceiptIcon } from '../components/portal/icons'
import type { OwnOrderSummary } from '../types/order'
import type { OrderBalance, OwnPayment } from '../types/payment'
import { orderCode } from '../utils/format'
import { SELAVA_PHONE, SELAVA_PHONE_HREF, formatDateTime, money } from '../utils/portal'

interface OrderPayments {
  order: OwnOrderSummary
  balance: OrderBalance
  payments: OwnPayment[]
}

const tabNames = ['Todos', 'Con saldo', 'Liquidados']
const hasBalance = ({ balance }: OrderPayments) => balance.saldo_pendiente > 0.004

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

function PaymentCard({ item, copied, onCopy }: { item: OrderPayments; copied: string; onCopy: (reference: string) => void }) {
  const { order, balance, payments } = item
  const code = orderCode(order.id)
  const pct = balance.total > 0 ? Math.min(100, Math.round((balance.total_pagado / balance.total) * 100)) : 100
  const due = hasBalance(item)
  return (
    <article className="cp-pc cp-st" style={delay(.38)} aria-labelledby={`pago-${order.id}`}>
      <div className="cp-pc-head">
        <div className="cp-pc-id">
          <span className="cp-ri"><ReceiptIcon size={26} /></span>
          <div><p>Pedido</p><h2 className="cp-disp" id={`pago-${order.id}`}>{code}</h2></div>
        </div>
        <div className="cp-pc-actions">
          <span className={`cp-chip${due ? '' : ' ok'}`}><span className="cp-dot" />{due ? 'Saldo pendiente' : 'Pagado'}</span>
          <Link className="cp-vp" to={`/mis-pedidos/${order.id}`} aria-label={`Ver detalle de ${code}`}>Ver pedido <ArrowUpRightIcon size={16} /></Link>
        </div>
      </div>

      <div className="cp-bar" role="img" aria-label={`Pagado ${money(balance.total_pagado)} de ${money(balance.total)}`}>
        <span className="cp-paid" style={{ width: `${pct}%` }} />
        {pct < 100 && <span className="cp-due" />}
      </div>
      <div className="cp-bar-legend"><span>{pct}% pagado</span><span>{100 - pct}% pendiente</span></div>

      <dl className="cp-tri">
        <div><dt>Total</dt><dd>{money(balance.total)}</dd></div>
        <div><dt><span className="cp-sw" style={{ background: '#0E9BD6' }} />Pagado</dt><dd style={{ color: '#06709F' }}>{money(balance.total_pagado)}</dd></div>
        <div className="cp-due-box"><dt><span className="cp-sw cp-stripes" />Saldo pendiente</dt><dd>{money(balance.saldo_pendiente)}</dd></div>
      </dl>

      <h3 className="cp-disp cp-pays-title">Historial de pagos</h3>
      {payments.length === 0
        ? <p className="cp-no-pays">Aún no hay pagos registrados para este pedido.</p>
        : <ol className="cp-pays" aria-label={`Pagos de ${code}`}>{payments.map((payment, index) => <PaymentRow key={payment.id} payment={payment} index={index} copied={copied === payment.referencia} onCopy={onCopy} />)}</ol>}
    </article>
  )
}

export function PaymentsPage() {
  const [orders, setOrders] = useState<OrderPayments[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [tab, setTab] = useState(0)
  const [copied, setCopied] = useState('')
  const copyTimer = useRef<number | undefined>(undefined)
  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setOrders([])
    getOwnOrders({ limite: 20, orden: 'recientes' }, controller.signal)
      .then(async (response) => Promise.all(response.pedidos.map(async (order) => {
        const [payments, balance] = await Promise.all([
          getOwnOrderPayments(order.id, controller.signal),
          getOwnOrderBalance(order.id, controller.signal),
        ])
        return { order, payments, balance }
      })))
      .then((items) => { setOrders(items); setStatus('ready') })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError') && (error as { name?: string })?.name !== 'CanceledError') setStatus('error')
      })
    return () => controller.abort()
  }, [reloadKey])

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const copy = useCallback((reference: string) => {
    void navigator.clipboard?.writeText(reference).catch(() => undefined)
    setCopied(reference)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(''), 1800)
  }, [])

  const eased = useCountUp(status === 'ready' && orders.length > 0)
  const total = orders.reduce((sum, item) => sum + item.balance.total, 0)
  const paid = orders.reduce((sum, item) => sum + item.balance.total_pagado, 0)
  const pending = orders.reduce((sum, item) => sum + item.balance.saldo_pendiente, 0)
  const paymentCount = orders.reduce((sum, item) => sum + item.payments.length, 0)
  const withBalance = orders.filter(hasBalance).length
  const pctPaid = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
  const counts = [orders.length, withBalance, orders.length - withBalance]
  const visible = orders.filter((item) => tab === 0 || (tab === 1) === hasBalance(item))

  return (
    <div className="cp-main">
      <PageHeading plain title="Mis pagos." lead="Consulta tus abonos y el saldo pendiente de cada pedido." />

      {status === 'loading' && <PortalLoading label="Cargando pagos…" />}
      {status === 'error' && <PortalError title="No pudimos cargar tus pagos." retry={retry} />}
      {status === 'ready' && orders.length === 0 && (
        <div className="cp-empty cp-pop">
          <span className="cp-empty-check"><ReceiptIcon size={34} /></span>
          <h2 className="cp-disp">Aún no tienes pagos.</h2>
          <p>Cuando registremos un pedido y sus pagos, podrás consultarlos en este espacio.</p>
        </div>
      )}
      {status === 'ready' && orders.length > 0 && (
        <>
          <section className="cp-pay-hero cp-st" style={delay(.22)} aria-label="Resumen de saldos">
            <Bubbles items={[{ left: '40%', size: 24 }, { left: '58%', size: 14, delay: 3 }]} />
            <div style={{ position: 'relative', minWidth: 0 }}>
              <p className="cp-eyebrow-sky" style={{ letterSpacing: '0.16em' }}>Saldo pendiente</p>
              <p className="cp-disp cp-big">{money(pending * eased)}</p>
              <p className="cp-sub">{withBalance === 0 ? 'Estás al día con todos tus pedidos.' : withBalance === 1 ? 'Corresponde a 1 pedido con saldo.' : `Repartido en ${withBalance} pedidos con saldo.`}</p>
              <dl className="cp-hstats">
                <div><dt>Total de pedidos</dt><dd>{money(total * eased)}</dd></div>
                <div><dt>Pagado</dt><dd style={{ color: '#5BC3EC' }}>{money(paid * eased)}</dd></div>
                <div><dt>Abonos</dt><dd>{paymentCount}</dd></div>
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

          <div className="cp-st cp-toolbar cp-pay-toolbar" style={delay(.3)}>
            <FilterTabs label="Filtrar pagos" tabs={tabNames.map((label, index) => ({ label, count: counts[index] }))} selected={tab} onSelect={setTab} />
            <a className="cp-lnk2" href={SELAVA_PHONE_HREF}>¿Dudas con un pago? <strong>{SELAVA_PHONE}</strong></a>
          </div>

          <div className="cp-list" style={{ gap: 20 }}>
            {visible.map((item) => <PaymentCard key={item.order.id} item={item} copied={copied} onCopy={copy} />)}
            {visible.length === 0 && (
              <div className="cp-empty cp-pop">
                <span className="cp-empty-check"><CheckIcon size={34} strokeWidth={1.8} /></span>
                <h2 className="cp-disp">{tab === 2 ? 'Aún no tienes pedidos liquidados' : 'No tienes saldos pendientes'}</h2>
                <p>{tab === 2 ? 'Cuando completes el pago de un pedido, aparecerá aquí.' : '¡Todo al día! No debes nada.'}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
