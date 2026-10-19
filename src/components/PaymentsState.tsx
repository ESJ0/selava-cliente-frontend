import { AlertCircle, LoaderCircle, WalletCards } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'

export function PaymentsLoading() {
  return <Card className="orders-state" role="status"><LoaderCircle className="state-spinner" aria-hidden="true" /><p>Cargando pagos…</p></Card>
}

export function PaymentsError({ retry }: { retry: () => void }) {
  return (
    <Card className="orders-state" role="alert">
      <AlertCircle aria-hidden="true" />
      <h2>No pudimos cargar tus pagos.</h2>
      <p>Revisa tu conexión e inténtalo nuevamente.</p>
      <Button onClick={retry}>Intentar de nuevo</Button>
    </Card>
  )
}

export function PaymentsEmpty() {
  return (
    <Card>
      <div className="empty-state">
        <span className="empty-icon"><WalletCards size={26} strokeWidth={1.5} aria-hidden="true" /></span>
        <h3>Aún no tienes pagos.</h3>
        <p>Cuando registremos un pedido y sus pagos, podrás consultarlos en este espacio.</p>
      </div>
    </Card>
  )
}
