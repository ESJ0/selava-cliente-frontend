import { useEffect, useState } from 'react'
import { getPublicGarmentTypes } from '../api/publicGarmentTypes'
import { getPublicPromotions, type PublicPromotion } from '../api/publicPromotions'
import type { PublicGarmentType } from '../types/publicGarmentType'

const REFRESH_MS = 60_000

/**
 * Promociones vigentes para la landing. Se vuelven a consultar cada minuto y al regresar a la pestaña,
 * así una promoción desactivada desaparece y una nueva aparece sin recargar la página.
 */
export function usePublicPromotions(limit = 4) {
  const [promotions, setPromotions] = useState<PublicPromotion[]>([])
  const [types, setTypes] = useState<PublicGarmentType[]>([])

  useEffect(() => {
    let controller: AbortController | null = null
    const load = () => {
      controller?.abort()
      const current = new AbortController()
      controller = current
      getPublicPromotions(current.signal)
        .then(async (promos) => {
          // La tarifa base solo se consulta cuando hay promociones que mostrar.
          const garmentTypes = promos.length ? await getPublicGarmentTypes(current.signal).catch(() => [] as PublicGarmentType[]) : []
          if (current.signal.aborted) return
          setPromotions(promos.slice().sort((a, b) => b.id - a.id).slice(0, limit))
          setTypes(garmentTypes)
        })
        .catch(() => { if (!current.signal.aborted) setPromotions([]) })
    }
    const timer = window.setTimeout(load, 0)
    const interval = window.setInterval(load, REFRESH_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      controller?.abort()
    }
  }, [limit])

  return { promotions, types }
}
