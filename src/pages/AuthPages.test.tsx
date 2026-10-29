import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  authErrorDetails,
  loginUnified,
  registerClient,
  requestPasswordReset,
  resetPassword,
  validatePasswordResetToken,
} from '../api/clientAuth'
import { AppRoutes } from '../routes/AppRoutes'
import { useClientSession } from '../store/session'

vi.mock('../api/clientAuth', () => ({
  authErrorDetails: vi.fn(),
  loginUnified: vi.fn(),
  registerClient: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  validatePasswordResetToken: vi.fn(),
}))

const loginUnifiedMock = vi.mocked(loginUnified)
const registerClientMock = vi.mocked(registerClient)
const authErrorDetailsMock = vi.mocked(authErrorDetails)
const requestPasswordResetMock = vi.mocked(requestPasswordReset)
const resetPasswordMock = vi.mocked(resetPassword)
const validatePasswordResetTokenMock = vi.mocked(validatePasswordResetToken)

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
    loginUnifiedMock.mockResolvedValue({ kind: 'cliente', session: { token: 'jwt-cliente', customer: { id: 8, email: 'ana@example.com' } } })
    renderRoute('/login')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ANA@EXAMPLE.COM')
    await user.type(screen.getByLabelText('Contraseña'), 'secreto-seguro')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(loginUnifiedMock).toHaveBeenCalledWith('ana@example.com', 'secreto-seguro'))
    expect(await screen.findByRole('heading', { name: /Hola de nuevo/ })).toBeInTheDocument()
    expect(useClientSession.getState().session?.token).toBe('jwt-cliente')
  })

  it('bloquea el formulario mientras espera y presenta credenciales inválidas', async () => {
    const user = userEvent.setup()
    let rejectLogin: (reason: Error) => void = () => undefined
    loginUnifiedMock.mockReturnValue(new Promise((_, reject) => { rejectLogin = reject }))
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

  it('solicita un enlace de recuperación sin revelar si la cuenta existe', async () => {
    const user = userEvent.setup()
    requestPasswordResetMock.mockResolvedValue('Si el correo existe, recibirás un enlace para restablecer tu contraseña.')
    renderRoute('/recuperar-contrasena')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ANA@EXAMPLE.COM')
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    await waitFor(() => expect(requestPasswordResetMock).toHaveBeenCalledWith('ana@example.com'))
    expect(screen.getByRole('status')).toHaveTextContent('Si el correo existe')
  })

  it('valida el token y permite establecer una contraseña nueva', async () => {
    const user = userEvent.setup()
    validatePasswordResetTokenMock.mockResolvedValue()
    resetPasswordMock.mockResolvedValue('Contraseña actualizada correctamente.')
    renderRoute('/restablecer-contrasena?token=token-seguro')

    await screen.findByLabelText('Nueva contraseña')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'nueva-segura')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'nueva-segura')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    await waitFor(() => expect(validatePasswordResetTokenMock).toHaveBeenCalledWith('token-seguro', expect.any(AbortSignal)))
    expect(resetPasswordMock).toHaveBeenCalledWith('token-seguro', 'nueva-segura')
    expect(await screen.findByRole('status')).toHaveTextContent('Contraseña actualizada correctamente.')
  })
})
