import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authErrorDetails, loginClient, registerClient } from '../api/clientAuth'
import { AppRoutes } from '../routes/AppRoutes'
import { useClientSession } from '../store/session'

vi.mock('../api/clientAuth', () => ({
  authErrorDetails: vi.fn(),
  loginClient: vi.fn(),
  registerClient: vi.fn(),
}))

const loginClientMock = vi.mocked(loginClient)
const registerClientMock = vi.mocked(registerClient)
const authErrorDetailsMock = vi.mocked(authErrorDetails)

function renderRoute(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

beforeEach(() => {
  vi.resetAllMocks()
  useClientSession.getState().clearSession()
  sessionStorage.clear()
})

describe('autenticación de clientes', () => {
  it('valida el registro antes de consultar la API', async () => {
    const user = userEvent.setup()
    renderRoute('/registro')

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(registerClientMock).not.toHaveBeenCalled()
    expect(screen.getAllByText('Es requerido.')).toHaveLength(4)
    expect(screen.getByText('Confirma tu contraseña.')).toBeInTheDocument()
  })

  it('envía los datos normalizados y conduce al login después del registro', async () => {
    const user = userEvent.setup()
    registerClientMock.mockResolvedValue({ cliente: { id: 8, nombre: 'Ana', apellido: 'López', telefono: '5555-1234', email: 'ana@example.com', activo: true } })
    renderRoute('/registro')

    await user.type(screen.getByLabelText('Nombre'), ' Ana ')
    await user.type(screen.getByLabelText('Apellido'), 'López')
    await user.type(screen.getByLabelText('Teléfono'), '5555-1234')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ANA@EXAMPLE.COM')
    await user.type(screen.getByLabelText('Dirección (opcional)'), 'Zona 1')
    await user.type(screen.getByLabelText('Contraseña'), 'secreto-seguro')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'secreto-seguro')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await waitFor(() => expect(registerClientMock).toHaveBeenCalledWith({
      nombre: 'Ana', apellido: 'López', telefono: '5555-1234', email: 'ana@example.com', direccion: 'Zona 1', password: 'secreto-seguro',
    }))
    expect(await screen.findByText('Tu cuenta fue creada. Ya puedes iniciar sesión.')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('ana@example.com')
  })

  it('muestra los errores de duplicado devueltos por el backend', async () => {
    const user = userEvent.setup()
    registerClientMock.mockRejectedValue(new Error('conflict'))
    authErrorDetailsMock.mockReturnValue({ message: 'Ya existe una cuenta con este correo.', fields: { email: 'ya está en uso' } })
    renderRoute('/registro')

    await user.type(screen.getByLabelText('Nombre'), 'Ana')
    await user.type(screen.getByLabelText('Apellido'), 'López')
    await user.type(screen.getByLabelText('Teléfono'), '5555-1234')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreto-seguro')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'secreto-seguro')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una cuenta con este correo.')
    expect(screen.getByText('ya está en uso')).toBeInTheDocument()
  })

  it('inicia sesión, guarda el JWT verificado y abre el portal privado', async () => {
    const user = userEvent.setup()
    loginClientMock.mockResolvedValue({ token: 'jwt-cliente', customer: { id: 8, email: 'ana@example.com' } })
    renderRoute('/login')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ANA@EXAMPLE.COM')
    await user.type(screen.getByLabelText('Contraseña'), 'secreto-seguro')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(loginClientMock).toHaveBeenCalledWith('ana@example.com', 'secreto-seguro'))
    expect(await screen.findByRole('heading', { name: /Hola de nuevo/ })).toBeInTheDocument()
    expect(useClientSession.getState().session?.token).toBe('jwt-cliente')
  })

  it('bloquea el formulario mientras espera y presenta credenciales inválidas', async () => {
    const user = userEvent.setup()
    let rejectLogin: (reason: Error) => void = () => undefined
    loginClientMock.mockReturnValue(new Promise((_, reject) => { rejectLogin = reject }))
    authErrorDetailsMock.mockReturnValue({ message: 'El correo o la contraseña son incorrectos.', fields: {} })
    renderRoute('/login')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(screen.getByRole('button', { name: 'Iniciando sesión...' })).toBeDisabled()

    rejectLogin(new Error('unauthorized'))
    expect(await screen.findByRole('alert')).toHaveTextContent('El correo o la contraseña son incorrectos.')
    expect(useClientSession.getState().session).toBeNull()
  })
})
