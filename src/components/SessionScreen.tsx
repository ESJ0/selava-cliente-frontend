import { createPortal } from 'react-dom'
import '../styles/session.css'

/**
 * Pantalla de transición al iniciar o cerrar sesión, con el logotipo de SELAVA.
 * Se monta en <body> con un portal: el encabezado usa backdrop-filter y, si quedara dentro,
 * la capa fija se recortaría a la barra superior en vez de cubrir toda la ventana.
 */
export function SessionScreen({ title, text, tone = 'in' }: { title: string; text: string; tone?: 'in' | 'out' }) {
  return createPortal(<div className={`ss-screen ${tone}`} role="status" aria-live="polite">
    <span className="ss-bubble b1" aria-hidden="true" /><span className="ss-bubble b2" aria-hidden="true" /><span className="ss-bubble b3" aria-hidden="true" />
    <section className="ss-card">
      <div className="ss-logo-wrap">
        <span className="ss-ring" aria-hidden="true" />
        <img className="ss-logo" src="/selava-logo.png" alt="SELAVA, Lavandería y Dry Clean" width={480} height={368} />
      </div>
      <p className="ss-title">{title}</p>
      <p className="ss-text">{text}</p>
      <div className="ss-dots" aria-hidden="true"><i /><i /><i /></div>
    </section>
  </div>, document.body)
}
