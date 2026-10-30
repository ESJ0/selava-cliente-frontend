import { afterEach, describe, expect, it, vi } from 'vitest'
import { authenticatedApi } from './client'
import { changeClientPassword, deleteClientProfilePhoto, getClientProfile, updateClientProfile, uploadClientProfilePhoto } from './profile'

afterEach(() => vi.restoreAllMocks())

describe('API de perfil SEL-115', () => {
  it('consulta y actualiza únicamente el perfil autenticado', async () => {
    const profile = { id: 7, nombre: 'Ana', apellido: 'López', telefono: '5555-1234', email: 'ana@example.com', activo: true, tiene_foto_perfil: false }
    const get = vi.spyOn(authenticatedApi, 'get').mockResolvedValue({ data: profile })
    const put = vi.spyOn(authenticatedApi, 'put').mockResolvedValue({ data: profile })
    expect(await getClientProfile()).toEqual(profile)
    await updateClientProfile({ nombre: 'Ana', apellido: 'López', telefono: '5555-1234', email: 'ana@example.com', direccion: 'Zona 1' })
    expect(get).toHaveBeenCalledWith('/cliente/me')
    expect(put).toHaveBeenCalledWith('/cliente/me', expect.objectContaining({ email: 'ana@example.com' }))
  })

  it('envía cambio de contraseña y gestión de foto a rutas privadas', async () => {
    const put = vi.spyOn(authenticatedApi, 'put').mockResolvedValue({ data: undefined })
    const remove = vi.spyOn(authenticatedApi, 'delete').mockResolvedValue({ data: undefined })
    await changeClientPassword('actual-segura', 'nueva-segura')
    const photo = new File(['foto'], 'perfil.png', { type: 'image/png' })
    await uploadClientProfilePhoto(photo)
    await deleteClientProfilePhoto()
    expect(put).toHaveBeenCalledWith('/cliente/me/password', { password_actual: 'actual-segura', password_nueva: 'nueva-segura' })
    expect(put).toHaveBeenCalledWith('/cliente/me/foto', expect.any(FormData))
    expect(remove).toHaveBeenCalledWith('/cliente/me/foto')
  })
})
