import { RefreshCw, Shirt } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../api/client'
import { getPublicGarmentTypes } from '../api/publicGarmentTypes'
import type { PublicGarmentType } from '../types/publicGarmentType'
import { Button } from './Button'
import { chargeUnit } from '../utils/chargeMode'

const priceFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

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
    <section id="precios" className="public-section services-section" aria-labelledby="garment-prices-title">
      <div className="public-section-heading">
        <span className="public-eyebrow">Precios de nuestras prendas</span>
        <h2 id="garment-prices-title">Precios por tipo de prenda</h2>
        <p>Consulta el precio de cada tipo de prenda. Los servicios asociados no añaden recargos.</p>
      </div>
      {status === 'loading' && (
        <div className="services-grid" aria-live="polite" aria-busy="true">
          <span className="sr-only">Cargando precios por tipo de prenda</span>
          {[0, 1, 2].map((item) => <div className="service-skeleton" key={item} aria-hidden="true" />)}
        </div>
      )}
      {status === 'error' && (
        <div className="public-status" role="alert">
          <h3>No pudimos mostrar los precios</h3>
          <p>{message}</p>
          <Button type="button" onClick={retry}><RefreshCw size={17} aria-hidden="true" />Intentar de nuevo</Button>
        </div>
      )}
      {status === 'success' && garmentTypes.length === 0 && (
        <div className="public-status">
          <Shirt size={28} aria-hidden="true" />
          <h3>El catálogo se está actualizando</h3>
          <p>Vuelve pronto para conocer los precios de nuestras prendas.</p>
        </div>
      )}
      {status === 'success' && garmentTypes.length > 0 && (
        <div className="services-grid">
          {garmentTypes.map((garmentType) => (
            <article className="service-card" key={garmentType.id}>
              <div className="service-icon" aria-hidden="true"><Shirt size={22} /></div>
              <h3>{garmentType.nombre}</h3>
              {garmentType.descripcion && <p>{garmentType.descripcion}</p>}
              <div className="service-meta">
                <strong>{priceFormatter.format(garmentType.precio)} <span className="pricing-unit">por {chargeUnit(garmentType.modalidad_cobro)}</span></strong>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="price-note">El precio corresponde al tipo de prenda y se confirma al registrar el pedido.</p>
    </section>
  )
}
