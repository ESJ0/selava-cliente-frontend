import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PublicFooter } from '../components/PublicFooter'
import { PublicHeader } from '../components/PublicHeader'

/** Estructura del sitio público: encabezado, página actual y pie de página. */
export function PublicLayout() {
  const { pathname } = useLocation()
  // Cada página abre desde arriba (jsdom no implementa scrollTo).
  useEffect(() => { if (import.meta.env.MODE !== 'test') window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="sl-landing">
      <a className="skip-link" href="#contenido-publico">Saltar al contenido</a>
      <PublicHeader />
      <main id="contenido-publico" className="sl-page">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
