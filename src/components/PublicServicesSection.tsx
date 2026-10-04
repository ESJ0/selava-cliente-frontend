import { Clock3, RefreshCw, Shirt } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../api/client'
import { getPublicServices } from '../api/publicServices'
import type { PublicService } from '../types/publicService'
import { Button } from './Button'

const priceFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

export function PublicServicesSection() {
  const [services, setServices] = useState<PublicService[]>([])
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [requestKey, setRequestKey] = useState(0)
  const retry = useCallback(() => setRequestKey((current) => current + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setMessage('')
    getPublicServices(controller.signal)
      .then((catalog) => {
        setServices(catalog)
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
    <section id="servicios" className="public-section services-section" aria-labelledby="services-title">
      <div className="public-section-heading">
        <span className="public-eyebrow">Lo que hacemos</span>
        <h2 id="services-title">Nuestros servicios y precios</h2>
        <p>Consulta las opciones disponibles y sus precios base actualizados.</p>
      </div>
      {status === 'loading' && (
        <div className="services-grid" aria-live="polite" aria-busy="true">
          <span className="sr-only">Cargando servicios y precios</span>
          {[0, 1, 2].map((item) => <div className="service-skeleton" key={item} aria-hidden="true" />)}
        </div>
      )}
      {status === 'error' && (
        <div className="public-status" role="alert">
          <h3>No pudimos mostrar los servicios</h3>
          <p>{message}</p>
          <Button type="button" onClick={retry}><RefreshCw size={17} aria-hidden="true" />Intentar de nuevo</Button>
        </div>
      )}
      {status === 'success' && services.length === 0 && (
        <div className="public-status">
          <Shirt size={28} aria-hidden="true" />
          <h3>El catálogo se está actualizando</h3>
          <p>Vuelve pronto para conocer nuestros servicios disponibles.</p>
        </div>
      )}
      {status === 'success' && services.length > 0 && (
        <div className="services-grid">
          {services.map((service) => (
            <article className="service-card" key={service.id}>
              <div className="service-icon" aria-hidden="true"><Shirt size={22} /></div>
              <h3>{service.nombre}</h3>
              {service.descripcion && <p>{service.descripcion}</p>}
              <div className="service-meta">
                <strong><span>Desde</span>{priceFormatter.format(service.precio_base)}</strong>
                {service.tiempo_estimado_horas !== null && <span><Clock3 size={16} aria-hidden="true" />Tiempo estimado: {service.tiempo_estimado_horas} h</span>}
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="price-note">Los precios mostrados son base y pueden variar según la prenda y el servicio requerido.</p>
    </section>
  )
}
