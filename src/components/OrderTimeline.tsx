import { CheckCircle2 } from 'lucide-react'
import type { OwnOrderHistoryEntry } from '../types/order'
import { formatDate } from '../utils/format'

export function OrderTimeline({ entries }: { entries: OwnOrderHistoryEntry[] }) {
  if (entries.length === 0) return <p className="muted-copy">Todavía no hay cambios de estado registrados.</p>
  return (
    <ol className="order-timeline" aria-label="Historial de estados">
      {entries.map((entry, index) => (
        <li key={entry.id} className={index === entries.length - 1 ? 'current' : ''}>
          <span className="timeline-marker"><CheckCircle2 size={18} aria-hidden="true" /></span>
          <div>
            <strong>{entry.estado.nombre}</strong>
            <time dateTime={entry.fecha_cambio}>{formatDate(entry.fecha_cambio, true)}</time>
            {entry.observaciones && <p>{entry.observaciones}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
