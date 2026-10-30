import type { ClientProfile, ClientProfileUpdate } from '../types/profile'
import { authenticatedApi } from './client'

export async function getClientProfile(): Promise<ClientProfile> {
  return (await authenticatedApi.get<ClientProfile>('/cliente/me')).data
}

export async function updateClientProfile(profile: ClientProfileUpdate): Promise<ClientProfile> {
  return (await authenticatedApi.put<ClientProfile>('/cliente/me', profile)).data
}

export async function changeClientPassword(passwordActual: string, passwordNueva: string): Promise<void> {
  await authenticatedApi.put('/cliente/me/password', { password_actual: passwordActual, password_nueva: passwordNueva })
}

export async function getClientProfilePhoto(): Promise<Blob> {
  return (await authenticatedApi.get<Blob>('/cliente/me/foto', { responseType: 'blob' })).data
}

export async function uploadClientProfilePhoto(photo: File): Promise<void> {
  const data = new FormData()
  data.append('foto', photo)
  await authenticatedApi.put('/cliente/me/foto', data)
}

export async function deleteClientProfilePhoto(): Promise<void> {
  await authenticatedApi.delete('/cliente/me/foto')
}
