import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { LEGAL_UPDATED, LEGAL_VERSION, PRIVACY, TERMS } from '../content/legal'
import '../styles/legal.css'

/** Páginas públicas de Términos y condiciones y Aviso de privacidad. */
export function LegalPage({ kind }: { kind: 'terminos' | 'privacidad' }) {
  const doc = kind === 'terminos' ? TERMS : PRIVACY
  const other = kind === 'terminos' ? { to: '/privacidad', label: 'Aviso de privacidad' } : { to: '/terminos', label: 'Términos y condiciones' }
  return (
    <div className="lg-page">
      <a className="skip-link" href="#contenido-legal">Saltar al contenido</a>
      <header className="lg-top">
        <div className="lg-wrap lg-top-inner">
          <Link to="/" className="sl-brand" aria-label="SELAVA, volver al inicio"><BrandMark /></Link>
          <nav className="lg-top-links" aria-label="Documentos legales">
            <Link className={kind === 'terminos' ? 'on' : undefined} to="/terminos" aria-current={kind === 'terminos' ? 'page' : undefined}>Términos</Link>
            <Link className={kind === 'privacidad' ? 'on' : undefined} to="/privacidad" aria-current={kind === 'privacidad' ? 'page' : undefined}>Privacidad</Link>
            <Link className="lg-login" to="/login">Iniciar sesión</Link>
          </nav>
        </div>
      </header>

      <section className="lg-hero">
        <span className="lg-bub b1" aria-hidden="true" /><span className="lg-bub b2" aria-hidden="true" />
        <div className="lg-wrap">
          <p className="lg-kicker">{doc.kicker}</p>
          <h1 className="lg-title">{doc.title}<span>.</span></h1>
          <p className="lg-lead">{doc.lead}</p>
          <p className="lg-meta"><span>Última actualización: {LEGAL_UPDATED}</span><span>Versión {LEGAL_VERSION}</span></p>
        </div>
      </section>

      <main id="contenido-legal" className="lg-wrap lg-body">
        <aside className="lg-toc" aria-label="Contenido">
          <p>Contenido</p>
          <ol>{doc.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title.replace(/^\d+\.\s*/, '')}</a></li>)}</ol>
          <Link className="lg-other" to={other.to}>Ver {other.label} →</Link>
        </aside>
        <article className="lg-doc">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="lg-section" aria-labelledby={`${section.id}-t`}>
              <h2 id={`${section.id}-t`}>{section.title}</h2>
              {section.paragraphs?.map((text) => <p key={text}>{text}</p>)}
              {section.items && <ul>{section.items.map((text) => <li key={text}>{text}</li>)}</ul>}
            </section>
          ))}
          <div className="lg-help">
            <strong>¿Tienes dudas?</strong>
            <span>Escríbenos por WhatsApp o llámanos al <a href="tel:+50238174898">3817-4898</a>.</span>
          </div>
        </article>
      </main>

      <footer className="lg-foot">
        <div className="lg-wrap lg-foot-inner">
          <span>© {new Date().getFullYear()} SELAVA · Lavandería y Dry Clean</span>
          <nav aria-label="Enlaces del pie"><Link to="/">Inicio</Link><Link to="/terminos">Términos</Link><Link to="/privacidad">Privacidad</Link></nav>
        </div>
      </footer>
    </div>
  )
}
