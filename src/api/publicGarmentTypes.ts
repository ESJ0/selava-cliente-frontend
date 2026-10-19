import { api } from './client'
import type { PublicGarmentType } from '../types/publicGarmentType'

export async function getPublicGarmentTypes(signal?: AbortSignal): Promise<PublicGarmentType[]> {
  const { data } = await api.get<PublicGarmentType[]>('/public/tipos-prenda', { signal })
  return data
}
