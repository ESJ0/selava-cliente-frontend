import { Fragment, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PublicIcon, type PublicIconName } from '../components/PublicIcon'
import { phoneHref as toPhoneHref, publicSiteContent } from '../content/publicSite'
import { useNow } from '../hooks/useNow'
import { usePublicPromotions } from '../hooks/usePublicPromotions'
import { openStatus } from '../utils/openingHours'

/** Enlaces antiguos de la landing (/#precios) llevan a su página. */
const legacyHashes: Record<string, string> = { '#precios': '/precios', '#promociones': '/promociones', '#nosotros': '/nosotros', '#contacto': '/contacto' }

const shirt = 'M20 2 L4 12 L10 24 L16 20 L16 54 L48 54 L48 20 L54 24 L60 12 L44 2 C40 8 24 8 20 2 Z'

function Drum() {
  return (
    <div className="sl-drumwrap sl-fade" aria-hidden="true">
      <div className="sl-drum-ring" />
      <div className="sl-drum-door" />
      <div className="sl-drum">
        <div className="sl-drum-spin" style={{ position: 'absolute', inset: 0 }}>
          <svg style={{ position: 'absolute', left: '18%', top: '14%', width: '34%' }} viewBox="0 0 64 56"><path d={shirt} fill="#FFC93C" /></svg>
          <svg style={{ position: 'absolute', right: '14%', top: '30%', width: '22%' }} viewBox="0 0 40 60"><path d="M8 2 H26 V36 L36 46 C40 52 34 58 28 54 L10 42 C8 40 8 38 8 36 Z" fill="#fff" /></svg>
          <svg style={{ position: 'absolute', left: '30%', bottom: '12%', width: '30%' }} viewBox="0 0 64 56"><path d={shirt} fill="#0E9BD6" /></svg>
        </div>
        <div className="sl-slosh" style={{ position: 'absolute', left: '-10%', right: '-10%', bottom: '-6%', height: '52%' }}>
          <svg className="sl-wave2" style={{ position: 'absolute', left: 0, top: 0, width: '200%', height: '100%' }} viewBox="0 0 800 200" preserveAspectRatio="none"><path d="M0 40 Q 50 10 100 40 T 200 40 T 300 40 T 400 40 T 500 40 T 600 40 T 700 40 T 800 40 V200 H0 Z" fill="#0E9BD6" opacity=".45" /></svg>
          <svg className="sl-wave" style={{ position: 'absolute', left: 0, top: 18, width: '200%', height: '100%' }} viewBox="0 0 800 200" preserveAspectRatio="none"><path d="M0 40 Q 50 70 100 40 T 200 40 T 300 40 T 400 40 T 500 40 T 600 40 T 700 40 T 800 40 V200 H0 Z" fill="#5BC3EC" opacity=".8" /></svg>
        </div>
        <span className="sl-bub" style={{ left: '30%', bottom: '10%', width: 22, height: 22 }} />
        <span className="sl-bub" style={{ left: '58%', bottom: '6%', width: 14, height: 14, animationDelay: '1.4s' }} />
        <span className="sl-bub" style={{ left: '44%', bottom: '14%', width: 30, height: 30, animationDelay: '2.6s' }} />
        <span className="sl-bub" style={{ left: '70%', bottom: '12%', width: 10, height: 10, animationDelay: '3.5s' }} />
        <div className="sl-drum-glass" />
      </div>
      <div className="sl-seal">
        <svg className="sl-stamp" style={{ position: 'absolute', inset: '6%', width: '88%', height: '88%' }} viewBox="0 0 200 200">
          <defs><path id="sl-circ" d="M100 100 m-72 0 a72 72 0 1 1 144 0 a72 72 0 1 1 -144 0" /></defs>
          <text fontFamily="Instrument Sans, sans-serif" fontSize="19" fontWeight="600" letterSpacing="4" fill="#0A2433"><textPath href="#sl-circ">CUIDADO PROFESIONAL · DESDE 2019 ·</textPath></text>
        </svg>
        <svg width="34%" viewBox="0 0 24 24" fill="none" stroke="#0A2433" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
      </div>
    </div>
  )
}

export function LandingPage() {
  const { contact, ribbon } = publicSiteContent
  const phoneHref = toPhoneHref(contact.phone)
  const now = useNow()
  const { promotions } = usePublicPromotions()
  const status = openStatus(now)
  const { hash } = useLocation()
  const navigate = useNavigate()
  useEffect(() => { if (legacyHashes[hash]) navigate(legacyHashes[hash], { replace: true }) }, [hash, navigate])

  const ribbonGroup = (hidden: boolean) => (
    <span className="sl-ribbon-group" aria-hidden={hidden || undefined}>
      {ribbon.map((item) => <Fragment key={item}>{item} <i>✦</i></Fragment>)}
    </span>
  )
  const cards: { to: string; icon: PublicIconName; kicker: string; title: string; text: string; tone: string }[] = [
    { to: '/precios', icon: 'tag', kicker: 'Precios', title: 'Cuánto cuesta cada prenda', text: 'Tarifas por unidad, por libra y por metro. Los servicios no añaden recargos.', tone: 'sky' },
    { to: '/promociones', icon: 'ticket', kicker: 'Promociones', title: promotions.length ? `${promotions.length} ${promotions.length === 1 ? 'paquete vigente' : 'paquetes vigentes'}` : 'Paquetes con descuento', text: 'Paga menos por lavar más con nuestros paquetes de temporada.', tone: 'sun' },
    { to: '/nosotros', icon: 'heart', kicker: 'Nosotros', title: 'Cuidado profesional desde 2019', text: 'Equipo italiano, insumos ecológicos y un equipo capacitado.', tone: 'mint' },
    { to: '/contacto', icon: 'pin', kicker: 'Visítanos', title: status.text, text: `${contact.placeDetail}, ${contact.place}. Mira el mapa y el horario.`, tone: status.open ? 'open' : 'navy' },
  ]

  return (
    <>
      <section className="sl-wrap sl-hero-section" aria-labelledby="landing-title">
        <div className="sl-hero">
          <div>
            <p className="sl-fade sl-kicker">{publicSiteContent.eyebrow}</p>
            <h1 id="landing-title" className="sl-disp">
              <span className="sl-line"><span>Tu ropa <span className="sl-foam">limpia,<svg viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true"><path d="M4 18 C 40 4, 70 28, 110 14 S 180 4, 220 16 S 280 22, 296 10" fill="none" stroke="#FFC93C" strokeWidth="9" strokeLinecap="round" /></svg></span>{' '}</span></span>
              <span className="sl-line"><span style={{ animationDelay: '.12s' }}>cuidada y lista{' '}</span></span>
              <span className="sl-line"><span style={{ animationDelay: '.24s', color: '#0E9BD6' }}>cuando la necesitas.</span></span>
            </h1>
            <p className="sl-fade sl-hero-lead">{publicSiteContent.heroDescription}</p>
            <div className="sl-fade sl-hero-actions">
              <Link className="sl-cta" to="/precios">Ver precios por prenda
                <svg className="sl-arr" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
              <a className="sl-call" href={phoneHref}>o llámanos al <strong>{contact.phone}</strong></a>
            </div>
          </div>
          <Drum />
        </div>
      </section>

      <div className="sl-ribbon" aria-hidden="true">
        <div className="sl-marquee sl-disp">{ribbonGroup(false)}{ribbonGroup(true)}</div>
      </div>

      <section className="sl-wrap sl-explore" aria-labelledby="explore-title">
        <div className="sl-explore-head">
          <p className="sl-eyebrow">Conoce SeLava</p>
          <h2 id="explore-title" className="sl-disp sl-h2">¿Qué estás <span>buscando?</span></h2>
        </div>
        <div className="sl-explore-grid">
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className={`sl-xcard ${card.tone}`}>
              <span className="sl-xcard-ic"><PublicIcon name={card.icon} size={24} /></span>
              <span className="sl-xcard-k">{card.kicker}</span>
              <span className="sl-disp sl-xcard-t">{card.title}</span>
              <span className="sl-xcard-p">{card.text}</span>
              <span className="sl-xcard-go">Ver más<PublicIcon name="right" size={18} width={2.2} /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
