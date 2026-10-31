import type { CSSProperties, ReactNode } from 'react'
import type { OrderFlowStage, OrderStatus } from '../../types/order'
import { currentStageIndex } from '../../utils/portal'
import { AlertIcon, SpinnerIcon } from './icons'

export const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` })

export function PageHeading({ title, lead, children, plain = false }: { title: ReactNode; lead: string; children?: ReactNode; plain?: boolean }) {
  return (
    <section className={`cp-heading${plain ? ' cp-heading-plain' : ''}`}>
      <div>
        <p className="cp-st cp-kicker">Portal de clientes</p>
        <h1 className="cp-disp cp-st cp-title" style={delay(.08)}>{title}</h1>
        <p className="cp-st cp-lead" style={delay(.16)}>{lead}</p>
      </div>
      {children}
    </section>
  )
}

export function Bubbles({ items }: { items: { right?: string; left?: string; size: number; delay?: number }[] }) {
  return <>{items.map((item, index) => (
    <span key={index} className="cp-bub" aria-hidden="true" style={{ right: item.right, left: item.left, bottom: -30, width: item.size, height: item.size, animationDelay: item.delay ? `${item.delay}s` : undefined }} />
  ))}</>
}

export function StateChip({ status, className = '', style }: { status: OrderStatus; className?: string; style?: CSSProperties }) {
  return <span className={`cp-pop cp-state-chip${status.es_cancelacion ? ' is-cancel' : ''} ${className}`} style={style} role="status" aria-label={`Estado actual: ${status.nombre}`}>{status.nombre}</span>
}

interface Tab { label: string; count: number }

export function FilterTabs({ label, tabs, selected, onSelect }: { label: string; tabs: Tab[]; selected: number; onSelect: (index: number) => void }) {
  return (
    <div role="tablist" aria-label={label} className="cp-tabs">
      <span className="cp-pill" style={{ transform: `translateX(${selected * 100}%)` }} aria-hidden="true" />
      {tabs.map((tab, index) => (
        <button key={tab.label} className="cp-tab" type="button" role="tab" aria-selected={index === selected} onClick={() => onSelect(index)}>
          {tab.label} <span className="cp-cnt">{tab.count}</span>
        </button>
      ))}
    </div>
  )
}

export function PortalLoading({ label }: { label: string }) {
  return <div className="cp-loading cp-st" role="status"><SpinnerIcon className="cp-spin" size={28} />{label}</div>
}

export function PortalError({ title, retry }: { title: string; retry: () => void }) {
  return (
    <div className="cp-empty cp-pop" role="alert">
      <span className="cp-empty-check" style={{ background: '#FFF4D6', color: '#9A6A00' }}><AlertIcon size={34} /></span>
      <h2 className="cp-disp">{title}</h2>
      <p>Revisa tu conexión e inténtalo nuevamente.</p>
      <button className="cp-btn-dark" type="button" onClick={retry}>Intentar de nuevo</button>
    </div>
  )
}

export function EmptyHanger({ title, text }: { title: string; text: string }) {
  return (
    <div className="cp-empty cp-pop">
      <svg className="cp-swing" width="96" height="90" viewBox="0 0 76 70" aria-hidden="true">
        <path d="M38 2 a6 6 0 1 1 6 6 c-3 0-6 2-6 6 v4" fill="none" stroke="#9DB3BE" strokeWidth="3" strokeLinecap="round" />
        <path d="M38 18 L4 46 H72 Z" fill="none" stroke="#9DB3BE" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <h2 className="cp-disp">{title}</h2>
      <p>{text}</p>
    </div>
  )
}

function stationColors(index: number, current: number) {
  if (index < current) return { bg: '#5BC3EC', ring: '#5BC3EC' }
  if (index === current) return { bg: '#FFC93C', ring: '#FFC93C' }
  return { bg: '#0A2433', ring: '#3E6A82' }
}

/** Riel de tintorería: la prenda colgada avanza hasta la etapa actual del flujo real. */
export function DryCleanRail({ stages, detailed = false }: { stages: OrderFlowStage[]; detailed?: boolean }) {
  const current = currentStageIndex(stages)
  const railPct = stages.length > 1 ? (current / (stages.length - 1)) * 100 : 0
  return (
    <>
      <div className="cp-rail" style={detailed ? { marginTop: 48 } : undefined} aria-hidden="true">
        <div className="cp-rail-track" />
        <div className="cp-rail-fill" style={{ width: `${railPct}%` }} />
        <div className="cp-carrier" style={{ left: `${railPct}%` }}>
          <div className="cp-swing">
            <svg width="76" height="120" viewBox="0 0 76 120">
              <path d="M38 2 a6 6 0 1 1 6 6 c-3 0-6 2-6 6 v4" fill="none" stroke="#C9D8DF" strokeWidth="3" strokeLinecap="round" />
              <path d="M38 18 L6 38 H70 Z" fill="none" stroke="#C9D8DF" strokeWidth="3" strokeLinejoin="round" />
              <path d="M16 36 L4 50 L12 60 L18 56 L18 112 L58 112 L58 56 L64 60 L72 50 L60 36 C54 44 22 44 16 36 Z" fill="#fff" />
              <path d="M30 37 L38 50 L46 37" fill="none" stroke="#0E9BD6" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="38" cy="62" r="2.2" fill="#9DB3BE" /><circle cx="38" cy="76" r="2.2" fill="#9DB3BE" /><circle cx="38" cy="90" r="2.2" fill="#9DB3BE" />
            </svg>
            <span className="cp-steam" style={{ left: 14, top: 64 }} />
            <span className="cp-steam" style={{ left: 36, top: 58, animationDelay: '.8s' }} />
            <span className="cp-steam" style={{ left: 54, top: 66, animationDelay: '1.6s' }} />
          </div>
        </div>
      </div>
      <ol className={`cp-stations${detailed ? ' cp-stations-detail' : ''}`} aria-label="Progreso del pedido" style={{ '--n': stages.length } as CSSProperties}>
        {stages.map((stage, index) => {
          const colors = stationColors(index, current)
          const isCurrent = index === current
          const done = index < current
          const labelColor = detailed ? (index <= current ? '#fff' : '#8AA3B0') : (isCurrent ? '#FFC93C' : done ? '#fff' : '#8AA3B0')
          return (
            <li key={stage.id} aria-current={isCurrent ? 'step' : undefined}>
              <span className={`cp-node${isCurrent ? ' cp-node-now' : ''}`} style={{ background: colors.bg, borderColor: colors.ring }} />
              <span className="cp-st-label" style={{ color: labelColor, fontWeight: detailed || isCurrent ? 600 : 500 }}>{stage.nombre}</span>
              {detailed && (
                <span className="cp-st-tag" style={{ color: done ? '#5BC3EC' : isCurrent ? '#FFC93C' : '#8AA3B0' }}>
                  {done ? 'Completado' : isCurrent ? 'Estado actual' : 'Pendiente'}
                </span>
              )}
              {detailed && stage.servicios.length > 0 && index <= current && (
                <span className="cp-st-svc">Servicio: {stage.servicios.map((service) => service.nombre).join(', ')}</span>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}
