import { useEffect, useRef, useState } from 'react'
import { mapsDirectionsHref, mapsEmbedSrc, publicSiteContent, wazeHref } from '../content/publicSite'
import { clock12, openStatus, scheduleGroups } from '../utils/openingHours'
import { PublicIcon } from './PublicIcon'

/** Ubicación y horario del local. WhatsApp, teléfono y redes están en el pie de página. */
export function PublicContactSection({ now }: { now: number }) {
  const { contact } = publicSiteContent
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const { day, open, text: openText } = openStatus(now, contact.week)
  const address = contact.addressLines.join(' ')
  const groups = scheduleGroups(contact.week)

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
            <p className="sl-eyebrow sl-ct-eyebrow">Visítanos</p>
            <h1 id="contact-title" className="sl-disp sl-h2">Pasa a <span className="sl-ct-hl">vernos.</span></h1>
            <p className="sl-ct-lead">Estamos en el {contact.place}, {contact.placeDetail}. Revisa nuestro horario antes de venir.</p>
          </div>
          <span className={`sl-openb ${open ? 'on' : 'off'}`} role="status"><i />{openText}</span>
        </div>

        <div className="sl-ct-grid">
          <div className="sl-ct-side">
            <div className="sl-ct-card sl-ct-hours sl-ct-in">
              <div className="sl-ct-hours-head"><span className="sl-ct-kicker">{<PublicIcon name="clock" size={16} width={2} />}Horario de atención</span></div>
              <ul>
                {groups.map((group) => {
                  const isToday = group.days.includes(day)
                  return <li key={group.label} className={isToday ? 'today' : undefined} aria-current={isToday ? 'date' : undefined}>
                    <div className="sl-ct-hgroup">
                      <span className="sl-ct-hlabel">{group.label}{isToday && <em>Hoy</em>}</span>
                      <span className="sl-ct-hdays" aria-hidden="true">{group.days.map((index) => <i key={index} className={index === day ? 'on' : undefined}>{contact.week[index].day[0]}</i>)}</span>
                    </div>
                    <div className="sl-ct-htime">
                      <span><small>Abre</small>{clock12(group.open)}</span>
                      <span className="sl-ct-hline" aria-hidden="true" />
                      <span><small>Cierra</small>{clock12(group.close)}</span>
                    </div>
                  </li>
                })}
              </ul>
            </div>
          </div>

          <div className="sl-ct-map sl-ct-in">
            <iframe className="sl-map-frame" title={`Mapa de ${contact.place}`} src={mapsEmbedSrc(contact.mapQuery)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            <div className="sl-ct-mapcard">
              <span className="sl-ct-mappin"><PublicIcon name="pin" size={22} width={2} /></span>
              <div className="sl-ct-mapinfo">
                <p className="sl-disp">{contact.placeDetail} · {contact.place}</p>
                <p>{contact.addressLines[0].replace(/\.$/, '')}</p>
              </div>
              <div className="sl-ct-mapactions">
                <button className="sl-ct-btn ghost" type="button" onClick={() => void copy()}><PublicIcon name="copy" size={16} width={2} /><span aria-live="polite">{copied ? '¡Copiada!' : 'Copiar'}</span></button>
                <a className="sl-ct-btn ghost" href={wazeHref(contact.mapQuery)} target="_blank" rel="noreferrer"><PublicIcon name="nav" size={16} width={2} />Waze</a>
                <a className="sl-ct-btn primary" href={mapsDirectionsHref(contact.mapQuery)} target="_blank" rel="noreferrer">Cómo llegar<PublicIcon name="arrow" size={16} width={2.2} /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
