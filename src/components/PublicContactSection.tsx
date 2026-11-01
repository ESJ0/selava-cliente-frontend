import { useEffect, useRef, useState } from 'react'
import { mapsDirectionsHref, mapsEmbedSrc, phoneHref, publicSiteContent, wazeHref, whatsappHref } from '../content/publicSite'

const pad = (hour: number) => `${String(hour).padStart(2, '0')}:00`
const icons = {
  Facebook: <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />,
  Instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></>,
  WhatsApp: <><path d="M4 20l1.3-4A8 8 0 1 1 8 18.8z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.4-1.6-1-2-2l1-1-1-2z" /></>,
}
const svg = (children: React.ReactNode, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>

/** Día (0 = lunes) y hora decimal en Guatemala, sin depender de la zona horaria del visitante. */
function guatemalaClock(now: number) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Guatemala', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date(now))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '0'
  const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday'))
  return { day: Math.max(0, day), hour: Number(get('hour')) + Number(get('minute')) / 60 }
}

export function PublicContactSection({ number, now }: { number: string; now: number }) {
  const { contact } = publicSiteContent
  const [copied, setCopied] = useState(false)
  const [realMap, setRealMap] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const { day, hour } = guatemalaClock(now)
  const today = contact.week[day]
  const next = contact.week[(day + 1) % 7]
  const open = hour >= today.open && hour < today.close
  const openText = open ? `Abierto ahora · cierra a las ${pad(today.close)}` : hour < today.open ? `Cerrado · abre hoy a las ${pad(today.open)}` : `Cerrado · abre mañana a las ${pad(next.open)}`
  const address = contact.addressLines.join(' ')
  const wa = whatsappHref(contact.whatsapp, contact.whatsappMessage)

  async function copy() {
    try { await navigator.clipboard?.writeText(address) } catch { /* el navegador no permite copiar */ }
    setCopied(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section id="contacto" className="sl-ct-section" aria-labelledby="contact-title">
      <div className="sl-wrap sl-ct-inner">
        <div className="sl-rv sl-ct-head">
          <div>
            <p className="sl-eyebrow sl-ct-eyebrow">{number} — Estamos para ayudarte</p>
            <h2 id="contact-title" className="sl-disp sl-h2">Pasa a vernos<br />o escríbenos.</h2>
          </div>
          <span className={`sl-openb ${open ? 'on' : 'off'}`} role="status"><i />{openText}</span>
        </div>

        <div className="sl-bento">
          <a className="sl-bx sl-bx-phone sl-rv" href={phoneHref(contact.phone)} aria-label={`Llamar al ${contact.phone}`}>
            <span className="sl-bxl">Llámanos</span>
            <span className="sl-disp sl-pnum">{contact.phone}</span>
            <span className="sl-bxgo">{svg(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />, 22)}</span>
            <span className="sl-ring1" aria-hidden="true" /><span className="sl-ring1 r2" aria-hidden="true" />
          </a>

          <div className="sl-bx sl-bx-map sl-rv">
            {realMap
              ? <iframe className="sl-map-frame" title={`Mapa de ${contact.place}`} src={mapsEmbedSrc(contact.mapQuery)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              : <>
                <svg className="sl-mapsvg" viewBox="0 0 600 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <rect width="600" height="520" fill="#123447" />
                  <rect x="60" y="330" width="150" height="110" rx="14" fill="#174A45" />
                  <rect x="430" y="80" width="110" height="80" rx="14" fill="#174A45" />
                  <g stroke="#1A3F53" strokeWidth="5" fill="none"><path d="M-20 120 L620 250" /><path d="M-20 210 L620 340" /><path d="M-20 400 L620 520" /><path d="M180 -20 L330 560" /><path d="M450 -20 L600 560" /></g>
                  <g stroke="#21536C" strokeWidth="14" fill="none" strokeLinecap="round"><path d="M-20 440 L620 90" /><path d="M90 -20 L250 560" /></g>
                  <path className="sl-route" d="M120 520 C 150 430, 200 400, 236 360 S 280 280, 300 250" fill="none" stroke="#FFC93C" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 12" />
                </svg>
                <div className="sl-pinw" aria-hidden="true"><span className="sl-pwave" /><span className="sl-pwave w2" /><svg width="44" height="56" viewBox="0 0 44 56"><path d="M22 2C11 2 3 10 3 21c0 14 19 32 19 32s19-18 19-32C41 10 33 2 22 2z" fill="#FFC93C" stroke="#0A2433" strokeWidth="3" /><circle cx="22" cy="21" r="7" fill="#0A2433" /></svg></div>
                <span className="sl-mtag">{contact.place}</span>
              </>}
            <button className="sl-maptoggle" type="button" aria-pressed={realMap} onClick={() => setRealMap(!realMap)}>
              {svg(realMap ? <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></> : <><circle cx="12" cy="10" r="3" /><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /></>, 16)}
              {realMap ? 'Ver ilustración' : 'Ver mapa interactivo'}
            </button>
            <div className="sl-mcard">
              <div style={{ minWidth: 0 }}>
                <p className="sl-disp sl-mcard-title">{contact.placeDetail}</p>
                <p className="sl-mcard-addr">{contact.addressLines[0].replace(/\.$/, '')}</p>
              </div>
              <div className="sl-mcard-actions">
                <button className="sl-cpyb" type="button" onClick={() => void copy()}>{svg(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></>, 16)}<span aria-live="polite">{copied ? '¡Copiada!' : 'Copiar dirección'}</span></button>
                <a className="sl-cpyb" href={wazeHref(contact.mapQuery)} target="_blank" rel="noreferrer">Waze</a>
                <a className="sl-gob" href={mapsDirectionsHref(contact.mapQuery)} target="_blank" rel="noreferrer">Cómo llegar{svg(<path d="M7 17L17 7M8 7h9v9" />, 16)}</a>
              </div>
            </div>
          </div>

          <div className="sl-bx sl-bx-hours sl-rv">
            <span className="sl-bxl">Horario</span>
            <ul>
              {contact.week.map((item, index) => <li key={item.day} className={index === day ? 'today' : undefined} aria-current={index === day ? 'date' : undefined}>
                <span>{item.day}{index === day && <em> · hoy</em>}</span><span>{pad(item.open)} – {pad(item.close)}</span>
              </li>)}
            </ul>
          </div>

          <div className="sl-bx sl-bx-socials sl-rv">
            <span className="sl-bxl">Síguenos</span>
            <div className="sl-sgrid">
              {contact.socials.map(({ label, href }) => <a key={label} className="sl-sti" href={href} target="_blank" rel="noreferrer" aria-label={label}>{svg(icons[label])}<span>{label}</span></a>)}
              <a className="sl-sti wa" href={wa} target="_blank" rel="noreferrer" aria-label={`Escribir por WhatsApp al ${contact.whatsapp}`}>{svg(icons.WhatsApp)}<span>WhatsApp · {contact.whatsapp}</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
