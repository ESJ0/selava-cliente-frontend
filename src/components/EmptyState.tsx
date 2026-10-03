import { ShoppingBag } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><ShoppingBag size={26} strokeWidth={1.5} aria-hidden="true" /></span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  )
}
