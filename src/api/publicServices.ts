import { api } from './client'
import type { PublicService } from '../types/publicService'

// Preparado para SEL-95. SEL-94 no muestra ni hardcodea servicios o precios.
export async function getPublicServices(signal?: AbortSignal): Promise<PublicService[]> {
  const { data } = await api.get<PublicService[]>('/public/servicios', { signal })
  return data
}
