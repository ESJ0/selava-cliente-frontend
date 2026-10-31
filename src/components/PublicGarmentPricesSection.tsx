import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { errorMessage } from '../api/client'
import { getPublicGarmentTypes } from '../api/publicGarmentTypes'
import type { PublicGarmentType } from '../types/publicGarmentType'
import { chargeUnit, type ChargeMode } from '../utils/chargeMode'

const kindLabels: Record<ChargeMode, string> = { UNIDAD: 'Prenda', LIBRA: 'Por peso', METRO: 'Textil' }

function formatAmount(price: number) {
  const digits = Number.isInteger(price) ? 0 : 2
  return new Intl.NumberFormat('es-GT', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(price)
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let index = 0; index < items.length; index += size) rows.push(items.slice(index, index + size))
  return rows
}

function Clothesline({ children }: { children: ReactNode }) {
  return (
    <div className="sl-line-rope">
      <svg className="sl-rope" viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 6 Q 500 96 1000 6" fill="none" stroke="#0A2433" strokeWidth="2" /></svg>
      <div className="sl-tags">{children}</div>
    </div>
  )
}

function Hanger({ position, children }: { position: number; children: ReactNode }) {
  return (
    <div className="sl-sag" style={{ marginTop: position === 1 ? 52 : 22 }}>
      <div className="sl-tag" style={position ? { animationDelay: `${position * -1.5}s` } : undefined}>
        <span className="sl-clip" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}

export function PublicGarmentPricesSection() {
  const [garmentTypes, setGarmentTypes] = useState<PublicGarmentType[]>([])
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [requestKey, setRequestKey] = useState(0)
  const retry = useCallback(() => setRequestKey((current) => current + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setMessage('')
    getPublicGarmentTypes(controller.signal)
      .then((catalog) => {
        setGarmentTypes(catalog)
        setStatus('success')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setMessage(errorMessage(error))
        setStatus('error')
      })
    return () => controller.abort()
  }, [requestKey])

  return (
    <section id="precios" className="sl-wrap sl-prices" aria-labelledby="garment-prices-title">
      <div className="sl-rv sl-prices-head">
        <div>
          <p className="sl-eyebrow">01 — Precios</p>
          <h2 id="garment-prices-title" className="sl-disp sl-h2">Precios por{' '}<br />tipo de prenda</h2>
        </div>
        <p>Consulta el precio de cada tipo de prenda. Los servicios asociados no añaden recargos.</p>
      </div>

      {status === 'loading' && (
        <div aria-live="polite" aria-busy="true">
          <span className="sl-sr-only">Cargando precios por tipo de prenda</span>
          <Clothesline>
            {[0, 1, 2].map((position) => (
              <Hanger key={position} position={position}>
                <div className="sl-tagcard sl-tagcard-ghost" aria-hidden="true" />
              </Hanger>
            ))}
          </Clothesline>
        </div>
      )}

      {status === 'error' && (
        <div className="sl-status" role="alert">
          <h3 className="sl-disp">No pudimos mostrar los precios</h3>
          <p>{message}</p>
          <button className="sl-cta" type="button" onClick={retry}>
            Intentar de nuevo
            <svg className="sl-arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" /></svg>
          </button>
        </div>
      )}

      {status === 'success' && garmentTypes.length === 0 && (
        <div className="sl-status">
          <svg width="40" height="40" viewBox="0 0 64 56" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" aria-hidden="true"><path d="M20 2 L4 12 L10 24 L16 20 L16 54 L48 54 L48 20 L54 24 L60 12 L44 2 C40 8 24 8 20 2 Z" /></svg>
          <h3 className="sl-disp">El catálogo se está actualizando</h3>
          <p>Vuelve pronto para conocer los precios de nuestras prendas.</p>
        </div>
      )}

      {status === 'success' && chunk(garmentTypes, 3).map((row, rowIndex) => (
        <div key={row[0].id} style={rowIndex ? { marginTop: 72 } : undefined}>
          <Clothesline>
            {row.map((garmentType, position) => (
              <Hanger key={garmentType.id} position={position}>
                <article className={`sl-tagcard${position === 1 ? ' sl-tagcard-blue' : ''}`}>
                  <span className="sl-tagcard-hole" aria-hidden="true" />
                  <p className="sl-tagcard-kind">{kindLabels[garmentType.modalidad_cobro] ?? kindLabels.UNIDAD}</p>
                  <h3 className="sl-disp">{garmentType.nombre}</h3>
                  {garmentType.descripcion && <p className="sl-tagcard-desc">{garmentType.descripcion}</p>}
                  <div className="sl-tagcard-price">
                    <span className="sl-disp sl-tagcard-amount"><span>Q</span>{formatAmount(garmentType.precio)}</span>
                    <span className="sl-tagcard-unit">{' '}por {chargeUnit(garmentType.modalidad_cobro)}</span>
                  </div>
                </article>
              </Hanger>
            ))}
          </Clothesline>
        </div>
      ))}

      <p className="sl-rv sl-price-note">El precio corresponde al tipo de prenda y se confirma al registrar el pedido.</p>
    </section>
  )
}
