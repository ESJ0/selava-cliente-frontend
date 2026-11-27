import { Link } from 'react-router-dom'
import { PublicContactSection } from '../components/PublicContactSection'
import { PublicGarmentPricesSection } from '../components/PublicGarmentPricesSection'
import { PublicIcon } from '../components/PublicIcon'
import { PublicPromotionsSection } from '../components/PublicPromotionsSection'
import { publicSiteContent } from '../content/publicSite'
import { useNow } from '../hooks/useNow'
import { usePublicPromotions } from '../hooks/usePublicPromotions'

function NextStep({ to, label, text }: { to: string; label: string; text: string }) {
  return (
    <div className="sl-wrap sl-nextstep">
      <p>{text}</p>
      <Link className="sl-nextstep-link" to={to}>{label}<PublicIcon name="right" size={18} width={2.2} /></Link>
    </div>
  )
}

export function PublicPricesPage() {
  return (
    <>
      <PublicGarmentPricesSection />
      <NextStep to="/promociones" label="Ver promociones" text="¿Llevas varias prendas? Revisa nuestros paquetes con descuento." />
    </>
  )
}

export function PublicPromotionsPage() {
  const now = useNow()
  const { promotions, types } = usePublicPromotions()
  if (!promotions.length) {
    return (
      <section className="sl-wrap sl-promos-empty" aria-labelledby="promos-empty-title">
        <p className="sl-eyebrow">Promociones</p>
        <h1 id="promos-empty-title" className="sl-disp sl-h2">Pronto tendremos <span>nuevas promociones.</span></h1>
        <p>Por ahora no hay paquetes vigentes. Mientras tanto, consulta nuestras tarifas por prenda.</p>
        <Link className="sl-cta" to="/precios">Ver precios por prenda<PublicIcon name="right" size={20} width={2} /></Link>
      </section>
    )
  }
  return (
    <>
      <PublicPromotionsSection promotions={promotions} types={types} now={now} />
      <NextStep to="/precios" label="Ver todas las tarifas" text="Lo que no complete un paquete se cobra con la tarifa base de cada prenda." />
    </>
  )
}

export function PublicAboutPage() {
  const { about } = publicSiteContent
  return (
    <>
      <section className="sl-about-section" aria-labelledby="about-title">
        <div className="sl-wrap sl-about">
          <div className="sl-rv">
            <p className="sl-eyebrow">Sobre nosotros</p>
            <h1 id="about-title" className="sl-disp">{about.title} <span>{about.highlight}</span></h1>
            <p className="sl-about-lead">{about.description}</p>
          </div>
          <ol className="sl-milestones">
            {about.milestones.map((milestone) => (
              <li key={milestone.year} className="sl-rv">
                <span className={`sl-disp sl-milestone-year${milestone.current ? ' is-now' : ''}`}>{milestone.year}</span>
                <div>
                  <h2 className="sl-disp">{milestone.title}</h2>
                  <p>{milestone.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <NextStep to="/contacto" label="Cómo llegar" text="Te esperamos en el Centro Comercial Centro San Juan, zona 7." />
    </>
  )
}

export function PublicContactPage() {
  const now = useNow()
  return <PublicContactSection now={now} />
}
