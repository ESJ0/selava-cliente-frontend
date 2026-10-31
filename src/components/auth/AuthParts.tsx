import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'

const delay = (value?: string): CSSProperties | undefined => (value ? { animationDelay: value } : undefined)

export function AuthHeading({ kicker, title, lead }: { kicker: string; title: ReactNode; lead: string }) {
  return (
    <>
      <p className="sl-st sl-auth-kicker" style={delay('.1s')}>{kicker}</p>
      <h1 className="sl-disp sl-st sl-auth-title" style={delay('.18s')}>{title}</h1>
      <p className="sl-st sl-auth-lead" style={delay('.26s')}>{lead}</p>
    </>
  )
}

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'placeholder'> {
  id: string
  label: ReactNode
  error?: string
  help?: string
  animationDelay?: string
  className?: string
  revealed?: boolean
  onToggleReveal?: () => void
  revealLabels?: [string, string]
}

export function AuthField({ id, label, error, help, animationDelay, className, revealed, onToggleReveal, revealLabels = ['Mostrar contraseña', 'Ocultar contraseña'], ...input }: AuthFieldProps) {
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div className={`sl-st${className ? ` ${className}` : ''}`} style={delay(animationDelay)}>
      <div className="sl-fld">
        <input id={id} placeholder=" " aria-invalid={Boolean(error)} aria-describedby={describedBy} {...input} />
        <label htmlFor={id}>{label}</label>
        <span className="sl-bar" />
        {onToggleReveal && (
          <button className="sl-eye" type="button" aria-label={revealed ? revealLabels[1] : revealLabels[0]} onClick={onToggleReveal}>
            {revealed
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 8.5 4.5 9.5 6-.5.8-1.6 2.2-3.1 3.5M6.5 7.6C4.6 8.9 3.2 10.8 2.5 12c1 1.5 4.5 6 9.5 6 1.6 0 3-.4 4.3-1.1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 12C3.5 10.5 7 6 12 6s8.5 4.5 9.5 6c-1 1.5-4.5 6-9.5 6s-8.5-4.5-9.5-6z" /><circle cx="12" cy="12" r="3" /></svg>}
          </button>
        )}
      </div>
      {help && <p id={`${id}-help`} className="sl-help">{help}</p>}
      {error && <span id={`${id}-error`} className="sl-err">{error}</span>}
    </div>
  )
}

export function Spinner() {
  return (
    <svg className="sl-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" opacity=".3" /><path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" /></svg>
  )
}

export function ArrowRight() {
  return <svg className="sl-arr" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
}

export function MailIcon({ size = 20, strokeWidth = 1.9 }: { size?: number; strokeWidth?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" /></svg>
}

export function CheckIcon({ size = 44, strokeWidth = 2.4 }: { size?: number; strokeWidth?: number }) {
  return <svg className="sl-check" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0A2433" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
}

export function AuthNote({ tone, children }: { tone: 'ok' | 'err'; children: ReactNode }) {
  return <div className={`sl-note sl-note-${tone}`} role={tone === 'ok' ? 'status' : 'alert'}>{children}</div>
}
