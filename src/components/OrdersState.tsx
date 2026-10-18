import { AlertCircle, LoaderCircle } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { EmptyState } from './EmptyState'

export function OrdersLoading({ label = 'Cargando pedidos…' }: { label?: string }) {
  return <Card className="orders-state" role="status"><LoaderCircle className="state-spinner" aria-hidden="true" /><p>{label}</p></Card>
}

export function OrdersError({ retry, message = 'No pudimos cargar tus pedidos.' }: { retry: () => void; message?: string }) {
  return <Card className="orders-state" role="alert"><AlertCircle aria-hidden="true" /><h2>{message}</h2><p>Revisa tu conexión e inténtalo nuevamente.</p><Button onClick={retry}>Intentar de nuevo</Button></Card>
}

export function OrdersEmpty() {
  return <Card><EmptyState title="Aún no tienes pedidos.">Cuando registremos tu primer pedido, aparecerá aquí con su estado y fecha estimada.</EmptyState></Card>
}
