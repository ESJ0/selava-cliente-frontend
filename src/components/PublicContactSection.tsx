import { useEffect, useRef, useState } from 'react'
import { mapsDirectionsHref, mapsEmbedSrc, phoneHref, publicSiteContent, wazeHref, whatsappHref } from '../content/publicSite'

const pad = (hour: number) => `${String(hour).padStart(2, '0')}:00`
/** Hora legible en formato de 12 horas: 9:00 a. m., 8:00 p. m. */
const clock = (hour: number) => `${hour % 12 || 12}:00 ${hour < 12 ? 'a. m.' : 'p. m.'}`
const rangeLabel = (names: string[]) => names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} y ${names[1].toLowerCase()}` : `${names[0]} a ${names[names.length - 1].toLowerCase()}`
const svg = (children: React.ReactNode, size = 22, width = 1.9) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
const icons = {
  Facebook: <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />,
  Instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></>,
  WhatsApp: <><path d="M4 20l1.3-4A8 8 0 1 1 8 18.8z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.4-1.6-1-2-2l1-1-1-2z" /></>,
  Phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  Arrow: <path d="M7 17L17 7M8 7h9v9" />,
  Copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></>,
  Pin: <><circle cx="12" cy="10" r="3" /><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /></>,
  Clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  Nav: <path d="M3 11l18-8-8 18-2-8z" />,
}

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
  const copyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const { day, hour } = guatemalaClock(now)
  const today = contact.week[day]
  const next = contact.week[(day + 1) % 7]
  const open = hour >= today.open && hour < today.close
  const openText = open ? `Abierto ahora · cierra a las ${pad(today.close)}` : hour < today.open ? `Cerrado · abre hoy a las ${pad(today.open)}` : `Cerrado · abre mañana a las ${pad(next.open)}`
  const address = contact.addressLines.join(' ')
  // Agrupa días consecutivos con el mismo horario: "Lunes a viernes", "Sábado y domingo".
  const groups = contact.week.reduce<{ label: string; days: number[]; open: number; close: number }[]>((acc, item, index) => {
    const last = acc[acc.length - 1]
    if (last && last.open === item.open && last.close === item.close) last.days.push(index)
    else acc.push({ label: '', days: [index], open: item.open, close: item.close })
    return acc
  }, []).map((group) => ({ ...group, label: rangeLabel(group.days.map((index) => contact.week[index].day)) }))

  async function copy() {
    try { await navigator.clipboard?.writeText(address) } catch { /* el navegador no permite copiar */ }
    setCopied(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section id="contacto" className="sl-ct-section" aria-labelledby="contact-title">
      <span className="sl-ct-glow g1" aria-hidden="true" /><span className="sl-ct-glow g2" aria-hidden="true" />
      <div className="sl-wrap sl-ct-inner">
        <div className="sl-ct-head sl-ct-in">
          <div>
            <p className="sl-eyebrow sl-ct-eyebrow">{number} — Estamos para ayudarte</p>
            <h2 id="contact-title" className="sl-disp sl-h2">Pasa a vernos<br />o <span className="sl-ct-hl">escríbenos.</span></h2>
          </div>
          <span className={`sl-openb ${open ? 'on' : 'off'}`} role="status"><i />{openText}</span>
        </div>

        <div className="sl-ct-grid">
          <div className="sl-ct-side">
            <a className="sl-ct-card sl-ct-wa sl-ct-in" href={whatsappHref(contact.whatsapp, contact.whatsappMessage)} target="_blank" rel="noreferrer" aria-label={`Escribir por WhatsApp al ${contact.whatsapp}`}>
              <span className="sl-ct-icon">{svg(icons.WhatsApp, 26)}</span>
              <span className="sl-ct-kicker">WhatsApp</span>
              <span className="sl-disp sl-ct-num">{contact.whatsapp}</span>
              <span className="sl-ct-sub">Te respondemos en horario de atención. El mensaje ya va escrito, solo envíalo.</span>
              <span className="sl-ct-go">Escribir ahora{svg(icons.Arrow, 18, 2.2)}</span>
            </a>

            <div className="sl-ct-row">
              <a className="sl-ct-card sl-ct-call sl-ct-in" href={phoneHref(contact.phone)} aria-label={`Llamar al ${contact.phone}`}>
                <span className="sl-ct-icon">{svg(icons.Phone, 22, 2)}</span>
                <span className="sl-ct-kicker">Llámanos</span>
                <span className="sl-disp sl-ct-num sm">{contact.phone}</span>
                <span className="sl-ring1" aria-hidden="true" /><span className="sl-ring1 r2" aria-hidden="true" />
              </a>
              <div className="sl-ct-card sl-ct-social sl-ct-in">
                <span className="sl-ct-kicker">Síguenos</span>
                <div className="sl-ct-socials">
                  {contact.socials.map(({ label, href }) => <a key={label} className={`sl-ct-soc ${label.toLowerCase()}`} href={href} target="_blank" rel="noreferrer" aria-label={label}>{svg(icons[label], 22, 1.8)}<span>{label}</span></a>)}
                </div>
              </div>
            </div>

            <div className="sl-ct-card sl-ct-hours sl-ct-in">
              <div className="sl-ct-hours-head"><span className="sl-ct-kicker">{svg(icons.Clock, 16, 2)}Horario de atención</span></div>
              <ul>
                {groups.map((group) => {
                  const isToday = group.days.includes(day)
                  return <li key={group.label} className={isToday ? 'today' : undefined} aria-current={isToday ? 'date' : undefined}>
                    <div className="sl-ct-hgroup">
                      <span className="sl-ct-hlabel">{group.label}{isToday && <em>Hoy</em>}</span>
                      <span className="sl-ct-hdays" aria-hidden="true">{group.days.map((index) => <i key={index} className={index === day ? 'on' : undefined}>{contact.week[index].day[0]}</i>)}</span>
                    </div>
                    <div className="sl-ct-htime">
                      <span><small>Abre</small>{clock(group.open)}</span>
                      <span className="sl-ct-hline" aria-hidden="true" />
                      <span><small>Cierra</small>{clock(group.close)}</span>
                    </div>
                  </li>
                })}
              </ul>
            </div>
          </div>

          <div className="sl-ct-map sl-ct-in">
            <iframe className="sl-map-frame" title={`Mapa de ${contact.place}`} src={mapsEmbedSrc(contact.mapQuery)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            <div className="sl-ct-mapcard">
              <span className="sl-ct-mappin">{svg(icons.Pin, 22, 2)}</span>
              <div className="sl-ct-mapinfo">
                <p className="sl-disp">{contact.placeDetail} · {contact.place}</p>
                <p>{contact.addressLines[0].replace(/\.$/, '')}</p>
              </div>
              <div className="sl-ct-mapactions">
                <button className="sl-ct-btn ghost" type="button" onClick={() => void copy()}>{svg(icons.Copy, 16, 2)}<span aria-live="polite">{copied ? '¡Copiada!' : 'Copiar'}</span></button>
                <a className="sl-ct-btn ghost" href={wazeHref(contact.mapQuery)} target="_blank" rel="noreferrer">{svg(icons.Nav, 16, 2)}Waze</a>
                <a className="sl-ct-btn primary" href={mapsDirectionsHref(contact.mapQuery)} target="_blank" rel="noreferrer">Cómo llegar{svg(icons.Arrow, 16, 2.2)}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
