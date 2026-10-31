import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfilePage } from './ProfilePage'

const mocks = vi.hoisted(() => ({
  getProfile: vi.fn(), updateProfile: vi.fn(), changePassword: vi.fn(), getPhoto: vi.fn(), uploadPhoto: vi.fn(), deletePhoto: vi.fn(),
}))
vi.mock('../api/profile', () => ({
  getClientProfile: mocks.getProfile,
  updateClientProfile: mocks.updateProfile,
  changeClientPassword: mocks.changePassword,
  getClientProfilePhoto: mocks.getPhoto,
  uploadClientProfilePhoto: mocks.uploadPhoto,
  deleteClientProfilePhoto: mocks.deletePhoto,
}))

const profile = { id: 7, nombre: 'Ana', apellido: 'López', telefono: '5555-1234', email: 'ana@example.com', direccion: 'Zona 1', activo: true, tiene_foto_perfil: false }

describe('ProfilePage SEL-115', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getProfile.mockResolvedValue(profile)
    mocks.updateProfile.mockResolvedValue(profile)
    mocks.changePassword.mockResolvedValue(undefined)
  })

  it('carga y actualiza los datos del cliente', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ProfilePage/></MemoryRouter>)
    expect(await screen.findByDisplayValue('Ana')).toBeInTheDocument()
    const phone = screen.getByLabelText('Teléfono')
    await user.clear(phone)
    await user.type(phone, '5555-9876')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ telefono: '5555-9876', email: 'ana@example.com' })))
    expect(await screen.findByRole('status')).toHaveTextContent('actualizaron correctamente')
  })

  it('valida y cambia la contraseña', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ProfilePage/></MemoryRouter>)
    await screen.findByDisplayValue('Ana')
    await user.click(screen.getByRole('tab', { name: 'Contraseña' }))
    await user.type(screen.getByLabelText('Contraseña actual'), 'anterior-segura')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'nueva-muy-segura')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'nueva-muy-segura')
    await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }))
    await waitFor(() => expect(mocks.changePassword).toHaveBeenCalledWith('anterior-segura', 'nueva-muy-segura'))
    expect(await screen.findByRole('status')).toHaveTextContent('contraseña fue actualizada')
  })

  it('rechaza una foto que supera el límite antes de enviarla', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ProfilePage/></MemoryRouter>)
    await screen.findByDisplayValue('Ana')
    const input = document.querySelector('input[type=file]') as HTMLInputElement
    await user.upload(input, new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' }))
    expect(screen.getByRole('alert')).toHaveTextContent('hasta 2 MB')
    expect(mocks.uploadPhoto).not.toHaveBeenCalled()
  })
})
