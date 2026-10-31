import { Fragment, type ReactNode } from 'react'
import { PublicHeader } from '../components/PublicHeader'
import { PublicGarmentPricesSection } from '../components/PublicGarmentPricesSection'
import { publicSiteContent } from '../content/publicSite'

const shirt = 'M20 2 L4 12 L10 24 L16 20 L16 54 L48 54 L48 20 L54 24 L60 12 L44 2 C40 8 24 8 20 2 Z'

const socialIcons: Record<string, ReactNode> = {
  Facebook: <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />,
  Instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></>,
  TikTok: <><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.8 2.4 4.6 5 5" /></>,
  WhatsApp: <><path d="M4 20l1.3-4A8 8 0 1 1 8 18.8z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.4-1.6-1-2-2l1-1-1-2z" /></>,
}

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

function CityMap() {
  return (
    <svg viewBox="0 0 600 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g stroke="#1E4A61" strokeWidth="10" fill="none" strokeLinecap="round">
        <path d="M-20 420 L620 80" /><path d="M80 -20 L260 600" /><path d="M360 -20 L520 600" />
      </g>
      <g stroke="#1A3F53" strokeWidth="4" fill="none">
        <path d="M-20 120 L620 260" /><path d="M-20 200 L620 340" /><path d="M-20 300 L620 440" /><path d="M-20 380 L620 520" />
        <path d="M180 -20 L340 600" /><path d="M440 -20 L600 600" />
      </g>
      <rect x="90" y="360" width="120" height="90" rx="10" fill="#1C5A52" />
      <rect x="420" y="120" width="80" height="60" rx="10" fill="#1C5A52" />
    </svg>
  )
}

export function LandingPage() {
  const { about, contact, ribbon } = publicSiteContent
  const phoneHref = `tel:${contact.phone.replace(/\D/g, '')}`
  const ribbonGroup = (hidden: boolean) => (
    <span className="sl-ribbon-group" aria-hidden={hidden || undefined}>
      {ribbon.map((item) => <Fragment key={item}>{item} <i>✦</i></Fragment>)}
    </span>
  )

  return (
    <div className="sl-landing">
      <a className="skip-link" href="#contenido-publico">Saltar al contenido</a>
      <PublicHeader />
      <main id="contenido-publico">
        <section id="inicio" className="sl-wrap sl-hero-section" aria-labelledby="landing-title">
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
                <a className="sl-cta" href="#precios">Ver precios por prenda
                  <svg className="sl-arr" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v16M5 13l7 7 7-7" /></svg>
                </a>
                <a className="sl-call" href={phoneHref}>o llámanos al <strong>{contact.phone}</strong></a>
              </div>
            </div>
            <Drum />
          </div>
        </section>

        <div className="sl-ribbon" aria-hidden="true">
          <div className="sl-marquee sl-disp">{ribbonGroup(false)}{ribbonGroup(true)}</div>
        </div>

        <PublicGarmentPricesSection />

        <section id="nosotros" className="sl-about-section" aria-labelledby="about-title">
          <div className="sl-wrap sl-about">
            <div className="sl-rv">
              <p className="sl-eyebrow">02 — Sobre nosotros</p>
              <h2 id="about-title" className="sl-disp">{about.title} <span>{about.highlight}</span></h2>
              <p className="sl-about-lead">{about.description}</p>
            </div>
            <ol className="sl-milestones">
              {about.milestones.map((milestone) => (
                <li key={milestone.year} className="sl-rv">
                  <span className={`sl-disp sl-milestone-year${milestone.current ? ' is-now' : ''}`}>{milestone.year}</span>
                  <div>
                    <h3 className="sl-disp">{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="contacto" className="sl-contact-section" aria-labelledby="contact-title">
          <div className="sl-wrap sl-contact-inner">
            <p className="sl-rv sl-eyebrow">03 — Estamos para ayudarte</p>
            <h2 id="contact-title" className="sl-disp sl-rv sl-h2">Contacto y ubicación</h2>
            <div className="sl-contact">
              <div className="sl-rv sl-contact-info">
                <div>
                  <p className="sl-contact-label">Teléfono</p>
                  <a className="sl-disp sl-phone" href={phoneHref}>{contact.phone}</a>
                </div>
                <div>
                  <p className="sl-contact-label" style={{ marginBottom: 14 }}>Horario</p>
                  <div className="sl-hours">
                    {contact.schedule.map(({ days, hours }) => <div key={days}><span>{days}</span><strong>{hours}</strong></div>)}
                  </div>
                </div>
                <div>
                  <p className="sl-contact-label">Dirección</p>
                  <p className="sl-address">{contact.addressLines.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}{index < contact.addressLines.length - 1 && ' '}</Fragment>)}</p>
                </div>
                <div>
                  <p className="sl-contact-label" style={{ marginBottom: 16 }}>Síguenos</p>
                  <div className="sl-socials">
                    {contact.socials.map(({ label, href }) => (
                      <a key={label} className="sl-soc" href={href} aria-label={label}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{socialIcons[label]}</svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sl-rv sl-map">
                <CityMap />
                <div className="sl-map-pin" aria-hidden="true"><span className="sl-pin" /><span /></div>
                <div className="sl-map-card">
                  <div>
                    <p className="sl-disp">{contact.place}</p>
                    <p>{contact.placeDetail}</p>
                  </div>
                  <a className="sl-cta" href={contact.mapUrl} target="_blank" rel="noreferrer">Cómo llegar
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="sl-footer">
        <div className="sl-wrap sl-footer-inner">
          <p className="sl-disp sl-footer-word" aria-hidden="true">SeLava</p>
          <div className="sl-footer-row">
            <span>Tu ropa en buenas manos.</span>
            <nav aria-label="Navegación secundaria">
              <a href="#precios">Precios</a>
              <a href="#nosotros">Nosotros</a>
              <a href="#contacto">Contacto</a>
            </nav>
            <span>© {new Date().getFullYear()} SeLava</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
