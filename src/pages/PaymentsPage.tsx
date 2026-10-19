import { CalendarDays, ExternalLink, ReceiptText, WalletCards } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnOrders } from '../api/orders'
import { getOwnOrderBalance, getOwnOrderPayments } from '../api/payments'
import { Card } from '../components/Card'
import { PaymentsEmpty, PaymentsError, PaymentsLoading } from '../components/PaymentsState'
import type { OwnOrderSummary } from '../types/order'
import type { OrderBalance, OwnPayment } from '../types/payment'
import { formatCurrency, formatDate, orderCode } from '../utils/format'

interface OrderPayments {
  order: OwnOrderSummary
  balance: OrderBalance
  payments: OwnPayment[]
}

export function PaymentsPage() {
  const [orders, setOrders] = useState<OrderPayments[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reloadKey, setReloadKey] = useState(0)
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

  return (
    <section className="payments-page" aria-labelledby="payments-page-title">
      <div className="page-heading"><h1 id="payments-page-title">Mis pagos</h1><p>Consulta tus abonos y el saldo pendiente de cada pedido.</p></div>
      {status === 'loading' && <PaymentsLoading />}
      {status === 'error' && <PaymentsError retry={retry} />}
      {status === 'ready' && orders.length === 0 && <PaymentsEmpty />}
      {status === 'ready' && orders.length > 0 && (
        <div className="payments-list">
          {orders.map(({ order, balance, payments }) => (
            <Card className="payment-order-card" key={order.id}>
              <div className="payment-order-heading">
                <div><span className="section-eyebrow">Pedido</span><h2>{orderCode(order.id)}</h2></div>
                <Link to={`/mis-pedidos/${order.id}`} aria-label={`Ver detalle de ${orderCode(order.id)}`}>Ver pedido<ExternalLink size={15} aria-hidden="true" /></Link>
              </div>
              <dl className="payment-balance-grid">
                <div><dt>Total</dt><dd>{formatCurrency(balance.total)}</dd></div>
                <div><dt>Pagado</dt><dd>{formatCurrency(balance.total_pagado)}</dd></div>
                <div className="pending-balance"><dt>Saldo pendiente</dt><dd>{formatCurrency(balance.saldo_pendiente)}</dd></div>
              </dl>
              <div className="payment-history">
                <h3><ReceiptText size={18} aria-hidden="true" />Historial de pagos</h3>
                {payments.length === 0 ? (
                  <p className="no-payments">Aún no hay pagos registrados para este pedido.</p>
                ) : (
                  <ul aria-label={`Pagos de ${orderCode(order.id)}`}>
                    {payments.map((payment) => (
                      <li key={payment.id}>
                        <span className="payment-icon"><WalletCards size={17} aria-hidden="true" /></span>
                        <div>
                          <strong>{payment.metodo_pago.nombre}</strong>
                          <span><CalendarDays size={13} aria-hidden="true" />{formatDate(payment.fecha_pago, true)}</span>
                          {payment.referencia && <span>Referencia: {payment.referencia}</span>}
                        </div>
                        <strong>{formatCurrency(payment.monto)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
