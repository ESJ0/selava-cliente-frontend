import { Link } from 'react-router-dom'
import { mapsDirectionsHref, phoneHref, publicSiteContent, whatsappHref } from '../content/publicSite'
import { BrandMark } from './BrandMark'
import { PublicIcon, type PublicIconName } from './PublicIcon'

const columns = [
  { title: 'Sitio', links: [{ to: '/', label: 'Inicio' }, { to: '/precios', label: 'Precios' }, { to: '/promociones', label: 'Promociones' }, { to: '/nosotros', label: 'Nosotros' }, { to: '/contacto', label: 'Contacto y horario' }] },
  { title: 'Clientes', links: [{ to: '/login', label: 'Iniciar sesión' }, { to: '/registro', label: 'Crear una cuenta' }, { to: '/recuperar-contrasena', label: 'Recuperar contraseña' }] },
  { title: 'Legal', links: [{ to: '/terminos', label: 'Términos y condiciones' }, { to: '/privacidad', label: 'Aviso de privacidad' }] },
]

/** Pie de página común a todas las páginas públicas: contacto, redes y enlaces. */
export function PublicFooter() {
  const { contact } = publicSiteContent
  const wa = whatsappHref(contact.whatsapp, contact.whatsappMessage)
  const socials: { label: string; href: string; icon: PublicIconName }[] = [
    { label: 'WhatsApp', href: wa, icon: 'whatsapp' },
    ...contact.socials.map(({ label, href }) => ({ label, href, icon: label.toLowerCase() as PublicIconName })),
  ]
  const quick = [
    { icon: 'whatsapp' as const, label: `WhatsApp ${contact.whatsapp}`, href: wa, external: true },
    { icon: 'phone' as const, label: `Llámanos al ${contact.phone}`, href: phoneHref(contact.phone), external: false },
    { icon: 'pin' as const, label: `${contact.placeDetail}, ${contact.place}`, href: mapsDirectionsHref(contact.mapQuery), external: true },
  ]

  return (
    <footer className="sl-ft">
      <div className="sl-ft-quick">
        <div className="sl-wrap sl-ft-quick-row">
          {quick.map((item) => (
            <a key={item.icon} className="sl-ft-q" href={item.href} {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
              <span className={`sl-ft-qi ${item.icon}`}><PublicIcon name={item.icon} size={18} width={2} /></span>{item.label}
            </a>
          ))}
          <Link className="sl-ft-q" to="/contacto"><span className="sl-ft-qi clock"><PublicIcon name="clock" size={18} width={2} /></span>Horario de atención</Link>
        </div>
      </div>

      <div className="sl-wrap sl-ft-main">
        <div className="sl-ft-brand">
          <Link to="/" className="sl-ft-logo" aria-label="SeLava, inicio"><BrandMark /></Link>
          <p className="sl-disp sl-ft-tag">Tu ropa en <span>buenas manos.</span></p>
          <p className="sl-ft-follow">Síguenos y escríbenos</p>
          <div className="sl-ft-socials">
            {socials.map((social) => (
              <a key={social.label} className={`sl-ft-soc ${social.icon}`} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                <PublicIcon name={social.icon} size={20} width={1.9} />
              </a>
            ))}
          </div>
        </div>
        {columns.map((column) => (
          <nav key={column.title} className="sl-ft-col" aria-label={column.title}>
            <h2>{column.title}</h2>
            <ul>{column.links.map((link) => <li key={link.to}><Link to={link.to}>{link.label}</Link></li>)}</ul>
          </nav>
        ))}
      </div>

      <div className="sl-wrap sl-ft-bottom">
        <span>© {new Date().getFullYear()} SeLava · Lavandería y Dry Clean</span>
        <span>{contact.addressLines.join(' ')}</span>
      </div>
    </footer>
  )
}
