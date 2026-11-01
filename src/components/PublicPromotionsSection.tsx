import type { PublicPromotion } from '../api/publicPromotions'
import type { PublicGarmentType } from '../types/publicGarmentType'

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const COLORS = [{ bg: '#FFC93C', ink: '#0A2433' }, { bg: '#0E9BD6', ink: '#0A2433' }]
const ICONS = {
  UNIDAD: 'M8 3L3 6l2 4 2-1v12h10V9l2 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z',
  LIBRA: 'M3 10h18l-2 10H5zM7 10l3-6M17 10l-3-6M9 14v3M12 14v3M15 14v3',
  METRO: 'M4 6h12a4 4 0 0 1 0 8H4zM16 10H4M4 14v4h12',
}
const PER = { UNIDAD: 'por unidad', LIBRA: 'por libra', METRO: 'por metro' }
const amount = (value: number) => value % 1 ? value.toFixed(2) : String(value)
const measure = (value: number, mode: PublicPromotion['modalidad_cobro']) => `${Math.round(value * 1000) / 1000} ${mode === 'LIBRA' ? 'lb' : mode === 'METRO' ? 'm' : value === 1 ? 'unidad' : 'u'}`
const longDate = (value: string) => { const date = new Date(value); return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}` }

export function PublicPromotionsSection({ promotions, types, number, now }: { promotions: PublicPromotion[]; types: PublicGarmentType[]; number: string; now: number }) {
  if (!promotions.length) return null
  const ends = promotions.map((promo) => Date.parse(promo.fecha_fin)).filter(Number.isFinite)
  const nearest = Math.min(...ends)
  const sameEnd = ends.every((end) => new Date(end).toDateString() === new Date(nearest).toDateString())
  const daysLeft = Math.max(0, Math.ceil((nearest - now) / 86400000))
  const nearestPromo = promotions.find((promo) => Date.parse(promo.fecha_fin) === nearest) ?? promotions[0]

  return (
    <section id="promociones" className="sl-promos-section" aria-labelledby="promos-title">
      <div className="sl-wrap sl-promos-inner">
        <div className="sl-rv sl-promos-head">
          <div>
            <p className="sl-eyebrow">{number} — Promociones</p>
            <h2 id="promos-title" className="sl-disp sl-h2">Paga menos por<br />lavar más.</h2>
          </div>
          <div className="sl-countdown">
            <span className="sl-cdn sl-disp">{daysLeft}</span>
            <span><strong>{daysLeft === 1 ? 'día restante' : 'días restantes'}</strong><small>{sameEnd ? `Vigentes hasta el ${longDate(nearestPromo.fecha_fin)}` : `La más próxima vence el ${longDate(nearestPromo.fecha_fin)}`}</small></span>
          </div>
        </div>
        <div className="sl-cpns">
          {promotions.map((promo, index) => {
            const type = types.find((item) => item.id === promo.tipo_prenda_id)
            const base = type?.precio ?? 0
            const normal = base * promo.medida_requerida
            const save = normal - promo.precio_promocional
            const pct = normal > 0 ? Math.round(save / normal * 100) : 0
            const color = COLORS[index % COLORS.length]
            const qty = measure(promo.medida_requerida, promo.modalidad_cobro)
            return (
              <article key={promo.id} className="sl-cpn sl-rv" style={{ '--cc': color.bg, '--ci': color.ink } as React.CSSProperties} aria-label={promo.nombre}>
                <div className="sl-cmain">
                  <div className="sl-ctop">
                    <span className="sl-ctype"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[promo.modalidad_cobro] ?? ICONS.UNIDAD} /></svg>{promo.tipo_prenda_nombre}</span>
                    {pct > 0 && <span className="sl-csave">−{pct}%</span>}
                  </div>
                  <p className="sl-disp sl-cbig">{qty} <span>por</span> Q{amount(promo.precio_promocional)}</p>
                  <p className="sl-cdesc">{save > 0
                    ? <>Normalmente pagarías <s>Q{amount(normal)}</s>. Te ahorras <b>Q{amount(save)}</b> en cada paquete de {qty}.</>
                    : promo.descripcion || promo.nombre}</p>
                </div>
                <div className="sl-ccut" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12" /></svg></div>
                <div className="sl-cstub">
                  <span className="sl-cstub-label">Tarifa base</span>
                  <span className="sl-disp sl-cstub-price">{base ? `Q${amount(base)}` : '—'}</span>
                  <span className="sl-cstub-per">{PER[promo.modalidad_cobro] ?? ''}</span>
                </div>
              </article>
            )
          })}
        </div>
        <p className="sl-rv sl-promos-note">La promoción aplica por paquete completo; lo que sobre se cobra con la tarifa base. Se confirma al registrar tu pedido.</p>
      </div>
    </section>
  )
}
