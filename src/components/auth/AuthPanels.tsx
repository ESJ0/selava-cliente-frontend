const ticketEdge = 'polygon(0 0,100% 0,100.00% 100%,93.75% calc(100% - 10px),87.50% 100%,81.25% calc(100% - 10px),75.00% 100%,68.75% calc(100% - 10px),62.50% 100%,56.25% calc(100% - 10px),50.00% 100%,43.75% calc(100% - 10px),37.50% 100%,31.25% calc(100% - 10px),25.00% 100%,18.75% calc(100% - 10px),12.50% 100%,6.25% calc(100% - 10px),0.00% 100%)'
const checkPath = 'M5 12.5l4.5 4.5L19 7.5'

export function LoginPanel() {
  return (
    <aside className="sl-panel" aria-hidden="true" style={{ background: '#0E9BD6', color: '#0A2433' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-around' }}>
        <div className="sl-kin"><span>LAVADO</span><span>SECADO</span><span>LAVADO</span><span>SECADO</span></div>
        <div className="sl-kin dn"><span>PLANCHADO</span><span>DRY CLEAN</span><span>PLANCHADO</span><span>DRY CLEAN</span></div>
        <div className="sl-kin"><span>CUIDADO</span><span>LISTO</span><span>CUIDADO</span><span>LISTO</span></div>
      </div>

      <p className="sl-disp sl-st sl-panel-kicker" style={{ position: 'relative', animationDelay: '.6s' }}>Portal de clientes</p>

      <div className="sl-tilt" style={{ position: 'relative', alignSelf: 'center', width: 330 }}>
        <div style={{ height: 26, borderRadius: 13, background: '#0A2433', boxShadow: '0 10px 30px -8px rgba(10,36,51,.6)' }} />
        <div style={{ overflow: 'hidden', margin: '-10px 22px 0', paddingTop: 10 }}>
          <div className="sl-ticket" style={{ background: '#fff', clipPath: ticketEdge, padding: '26px 26px 34px', fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px dashed #C9D8DF', paddingBottom: 14, marginBottom: 14 }}>
              <span className="sl-disp" style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>Se<span style={{ color: '#06709F' }}>Lava</span></span>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', color: '#5A7280' }}>TICKET</span>
            </div>
            <div className="sl-ticket-row"><span>Camisa × 3</span><strong>Q 75.00</strong></div>
            <div className="sl-ticket-row"><span>Canasta · 4 lb</span><strong>Q 48.00</strong></div>
            <div className="sl-ticket-row" style={{ padding: '6px 0 14px', borderBottom: '1.5px dashed #C9D8DF' }}><span>Alfombra · 2 m</span><strong>Q 80.00</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 18px' }}><span style={{ fontWeight: 600 }}>Estado</span><span className="sl-dots" style={{ display: 'inline-flex', gap: 4 }}><span /><span /><span /></span></div>
            <div style={{ height: 44, background: 'repeating-linear-gradient(90deg, #0A2433 0 2px, transparent 2px 4px, #0A2433 4px 7px, transparent 7px 9px, #0A2433 9px 10px, transparent 10px 13px)' }} />
          </div>
        </div>
        <div className="sl-stampx" style={{ position: 'absolute', right: -18, bottom: 60, width: 108, height: 108, borderRadius: '50%', background: '#FFC93C', border: '3px solid #0A2433', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px -10px rgba(10,36,51,.5)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0A2433" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d={checkPath} /></svg>
          <span className="sl-disp" style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>LISTO</span>
        </div>
      </div>

      <div className="sl-st" style={{ position: 'relative', animationDelay: '.8s' }}>
        <p className="sl-disp sl-panel-title">Tu pedido<br />te está esperando.</p>
        <p className="sl-panel-text">Inicia sesión y sigue cada prenda, del mostrador a tus manos.</p>
      </div>
    </aside>
  )
}

const careIcons = [
  { label: 'Lavado', className: 'sl-care', icon: <><path d="M4 13 L8 32 H32 L36 13" /><path d="M6 13 q3.5 -4 7 0 t7 0 t7 0 t7 0" /></> },
  { label: 'Secado', className: 'sl-care c2', icon: <><rect x="6" y="6" width="28" height="28" rx="3" /><circle cx="20" cy="20" r="9" /></> },
  { label: 'Planchado', className: 'sl-care c3', icon: <><path d="M5 30 H35 C35 20 29 14 19 14 H12 C11 22 8 26 5 30 Z" /><path d="M15 14 V10 H31" /></> },
  { label: 'Dry clean', className: 'sl-care c4', icon: <><circle cx="20" cy="20" r="13" /><path d="M16 27 V13 h5 a4 4 0 0 1 0 8 h-5" /></> },
]

export function RegisterPanel() {
  return (
    <aside className="sl-panel" aria-hidden="true" style={{ background: '#0A2433', color: '#fff' }}>
      <p className="sl-disp sl-st sl-panel-kicker" style={{ animationDelay: '.6s', color: '#5BC3EC' }}>Etiqueta de cuidado</p>

      <div style={{ position: 'relative', alignSelf: 'center', width: 300 }}>
        <div style={{ height: 30, margin: '0 -40px', borderRadius: 10, background: '#0E9BD6' }} />
        <div className="sl-flut" style={{ margin: '-6px 18px 0' }}>
          <div style={{ position: 'relative', background: '#fff', color: '#0A2433', borderRadius: '0 0 14px 14px', padding: '34px 28px 30px', boxShadow: '0 30px 50px -24px rgba(0,0,0,.7)' }}>
            <svg style={{ position: 'absolute', inset: 8, width: 'calc(100% - 16px)', height: 'calc(100% - 16px)', overflow: 'visible' }}><rect className="sl-stitch" x="0" y="0" width="100%" height="100%" rx="8" fill="none" stroke="#0E9BD6" strokeWidth="2" /></svg>
            <p className="sl-disp" style={{ margin: 0, textAlign: 'center', fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>Se<span style={{ color: '#06709F' }}>Lava</span></p>
            <p style={{ margin: '4px 0 22px', textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: '.18em', color: '#3E5866' }}>HECHO PARA TI</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, padding: '18px 0', borderTop: '1.5px solid #DCE7EC', borderBottom: '1.5px solid #DCE7EC' }}>
              {careIcons.map(({ label, className, icon }) => (
                <div key={label} className="sl-care-cell">
                  <svg className={className} width="42" height="42" viewBox="0 0 40 40" fill="none" stroke="#0A2433" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                  <p>{label}</p>
                </div>
              ))}
            </div>
            <div className="sl-care-row" style={{ marginTop: 18 }}><span>Composición</span><span>100% tuyo</span></div>
            <div className="sl-care-row"><span>Talla</span><span>Única</span></div>
          </div>
        </div>
      </div>

      <div className="sl-st" style={{ animationDelay: '.8s' }}>
        <p className="sl-disp sl-panel-title">Una cuenta<br />hecha a tu medida.</p>
        <p className="sl-panel-text" style={{ color: '#A9C1CD' }}>Registra tus datos una vez y consulta pedidos y pagos cuando quieras.</p>
      </div>
    </aside>
  )
}

export function RecoveryPanel() {
  return (
    <aside className="sl-panel sl-denim" aria-hidden="true" style={{ color: '#fff' }}>
      <p className="sl-disp sl-st sl-panel-kicker" style={{ animationDelay: '.6s', color: '#FFC93C' }}>Revisamos cada bolsillo</p>

      <div style={{ position: 'relative', alignSelf: 'center', width: 300, height: 380 }}>
        <svg className="sl-slip" style={{ position: 'absolute', left: 150, top: 40, width: 74 }} viewBox="0 0 74 110"><rect x="2" y="2" width="70" height="106" rx="6" fill="#fff" /><path d="M14 22 H58 M14 36 H50 M14 50 H56" stroke="#9DB3BE" strokeWidth="4" strokeLinecap="round" /></svg>
        <svg className="sl-key" style={{ position: 'absolute', left: 86, top: 0, width: 62 }} viewBox="0 0 60 170">
          <circle cx="30" cy="30" r="26" fill="#FFC93C" /><circle cx="30" cy="26" r="9" fill="#1D3B5E" />
          <rect x="24" y="52" width="12" height="110" rx="3" fill="#FFC93C" />
          <rect x="36" y="118" width="14" height="9" rx="2" fill="#FFC93C" /><rect x="36" y="138" width="10" height="9" rx="2" fill="#FFC93C" />
        </svg>
        <svg className="sl-spark" style={{ position: 'absolute', left: 40, top: 10, width: 40 }} viewBox="0 0 24 24" fill="none" stroke="#FFC93C" strokeWidth="2" strokeLinecap="round"><path d="M12 2v5M12 17v5M2 12h5M17 12h5" /></svg>
        <svg style={{ position: 'absolute', left: 0, top: 110, width: 300, height: 270 }} viewBox="0 0 300 270">
          <path d="M10 10 H290 V190 L150 262 L10 190 Z" fill="#26497A" />
          <path d="M10 10 H290 V190 L150 262 L10 190 Z" fill="none" stroke="#14304F" strokeWidth="3" />
          <path className="sl-stitch" d="M24 34 H276 V182 L150 246 L24 182 Z" fill="none" stroke="#FFC93C" strokeWidth="2.2" />
          <path className="sl-stitch" d="M34 44 H266 V176 L150 236 L34 176 Z" fill="none" stroke="#FFC93C" strokeWidth="2.2" opacity=".7" />
          <path d="M10 22 H290" stroke="#14304F" strokeWidth="2" opacity=".6" />
          <circle cx="22" cy="22" r="6" fill="#D9A441" /><circle cx="278" cy="22" r="6" fill="#D9A441" />
          <rect x="118" y="120" width="64" height="26" rx="4" fill="#0E9BD6" />
          <text x="150" y="138" textAnchor="middle" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="800" fontSize="14" fill="#0A2433">SeLava</text>
        </svg>
      </div>

      <div className="sl-st" style={{ animationDelay: '.8s' }}>
        <p className="sl-disp sl-panel-title">Lo que se olvida,<br />aquí aparece.</p>
        <p className="sl-panel-text" style={{ color: '#C9D8E6' }}>Si no ves el correo, revisa también tu carpeta de spam.</p>
      </div>
    </aside>
  )
}
