import type { AppliedPromotion } from '../types/promotion'
import { formatCurrency } from '../utils/format'

const measure = (value: number, mode: string) => `${new Intl.NumberFormat('es-GT', { maximumFractionDigits: 3 }).format(value)} ${mode === 'LIBRA' ? 'lb' : mode === 'METRO' ? 'm' : value === 1 ? 'unidad' : 'unidades'}`

export function AppliedPromotions({ promotions }: { promotions: AppliedPromotion[] }) {
  return <section className="applied-promotions" aria-label="Promociones aplicadas">
    <h2>Promociones aplicadas</h2>
    {promotions.map(p => <article key={p.promocion_id}>
      <h3>{p.nombre}</h3><p>{p.tipo_prenda_nombre} · {measure(p.medida_requerida, p.modalidad_cobro_aplicada)} por {formatCurrency(p.precio_promocional)}</p>
      <dl>
        <div><dt>Aplicaciones</dt><dd>{p.aplicaciones}</dd></div>
        <div><dt>Medida cubierta</dt><dd>{measure(p.medida_cubierta, p.modalidad_cobro_aplicada)}</dd></div>
        <div><dt>Importe promocional</dt><dd>{formatCurrency(p.subtotal_promocional)}</dd></div>
        <div><dt>Sobrante</dt><dd>{measure(p.sobrante, p.modalidad_cobro_aplicada)} × {formatCurrency(p.precio_normal_aplicado)}</dd></div>
        <div><dt>Importe normal</dt><dd>{formatCurrency(p.subtotal_normal)}</dd></div>
        <div><dt>Subtotal con promoción</dt><dd>{formatCurrency(p.subtotal_total)}</dd></div>
      </dl>
    </article>)}
  </section>
}
