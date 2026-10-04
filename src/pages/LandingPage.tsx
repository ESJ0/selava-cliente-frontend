import { ArrowDown, Clock3, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react'
import { PublicHeader } from '../components/PublicHeader'
import { PublicServicesSection } from '../components/PublicServicesSection'
import { publicSiteContent } from '../content/publicSite'

export function LandingPage() {
  const { about, contact } = publicSiteContent
  const hasContactInformation = Boolean(contact.phone || contact.schedule || contact.address)
  return (
    <div className="public-site">
      <a className="skip-link" href="#contenido-publico">Saltar al contenido</a>
      <PublicHeader />
      <main id="contenido-publico">
        <section id="inicio" className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-content">
            <span className="hero-pill"><Sparkles size={16} aria-hidden="true" />{publicSiteContent.eyebrow}</span>
            <h1 id="landing-title">{publicSiteContent.heroTitle}</h1>
            <p>{publicSiteContent.heroDescription}</p>
            <a className="button hero-button" href="#servicios">Ver servicios y precios<ArrowDown size={17} aria-hidden="true" /></a>
            <div className="hero-trust"><ShieldCheck size={19} aria-hidden="true" /><span>Cuidado profesional para tus prendas</span></div>
          </div>
          <div className="landing-visual" aria-hidden="true">
            <div className="washer"><span className="washer-panel" /><span className="washer-door"><span /></span></div>
            <span className="bubble bubble-one" /><span className="bubble bubble-two" /><span className="bubble bubble-three" />
          </div>
        </section>
        <PublicServicesSection />
        <section id="nosotros" className="public-section about-section" aria-labelledby="about-title">
          <div className="about-accent" aria-hidden="true"><Sparkles size={42} /></div>
          <div>
            <span className="public-eyebrow">Sobre nosotros</span>
            <h2 id="about-title">{about.title}</h2>
            {about.description ? <p>{about.description}</p> : <div className="pending-content"><strong>Historia en preparación</strong><p>Próximamente compartiremos la historia de SeLava y aquello que hace especial nuestro servicio.</p></div>}
          </div>
        </section>
        <section id="contacto" className="public-section contact-section" aria-labelledby="contact-title">
          <div className="public-section-heading">
            <span className="public-eyebrow">Estamos para ayudarte</span>
            <h2 id="contact-title">Contacto y ubicación</h2>
            <p>Encuentra aquí nuestros datos de atención y cómo llegar.</p>
          </div>
          {hasContactInformation ? (
            <div className="contact-grid">
              {contact.phone && <div className="contact-item"><Phone aria-hidden="true" /><div><strong>Teléfono</strong><a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></div></div>}
              {contact.schedule && <div className="contact-item"><Clock3 aria-hidden="true" /><div><strong>Horario</strong><span>{contact.schedule}</span></div></div>}
              {contact.address && <div className="contact-item"><MapPin aria-hidden="true" /><div><strong>Dirección</strong><span>{contact.address}</span></div></div>}
            </div>
          ) : <div className="pending-content contact-pending"><MapPin size={28} aria-hidden="true" /><div><strong>Información en preparación</strong><p>El teléfono, horario, dirección y mapa estarán disponibles próximamente.</p></div></div>}
          {contact.mapEmbedUrl && <iframe className="location-map" src={contact.mapEmbedUrl} title="Ubicación de SeLava" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
        </section>
      </main>
      <footer className="public-footer">
        <div><span className="footer-brand">SeLava</span><span>Tu ropa en buenas manos.</span></div>
        <nav aria-label="Navegación secundaria"><a href="#servicios">Servicios</a><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a></nav>
      </footer>
    </div>
  )
}
