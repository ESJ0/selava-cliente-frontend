import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getOwnOrders } from '../api/orders'
import { AppRoutes } from '../routes/AppRoutes'
import { useProfilePhoto } from '../store/profilePhoto'
import { useClientSession } from '../store/session'

vi.mock('../api/orders', () => ({ getOwnOrders: vi.fn(), getOwnGarmentTypes: vi.fn().mockResolvedValue([]), getOwnOrderDetail: vi.fn().mockRejectedValue(new Error('sin detalle')) }))
vi.mock('../api/profile', () => ({
  getClientProfile: vi.fn().mockResolvedValue({ id: 7, nombre: 'Ana', apellido: 'Pérez', telefono: '5555-1234', email: 'ana@example.com', direccion: 'Zona 1', activo: true, tiene_foto_perfil: false }),
  getClientProfilePhoto: vi.fn(), updateClientProfile: vi.fn(), changeClientPassword: vi.fn(), uploadClientProfilePhoto: vi.fn(), deleteClientProfilePhoto: vi.fn(),
}))
const getOwnOrdersMock = vi.mocked(getOwnOrders)

function renderPortal(path = '/inicio') {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

const testSession = { customer: { id: 7, nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com' }, token: 'test-session-only' }

beforeEach(() => {
  getOwnOrdersMock.mockReset().mockResolvedValue({ pedidos: [], total: 0, pagina: 1, limite: 100 })
  useClientSession.getState().clearSession()
  sessionStorage.clear()
})

describe('Home SEL-94', () => {
  it('redirige al login cuando no existe una sesión de cliente', () => {
    renderPortal()
    expect(screen.getByRole('heading', { name: 'Hola de nuevo.' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).not.toBeInTheDocument()
  })

  it('muestra propuesta y pedido vacío con una sesión válida', async () => {
    useClientSession.getState().setSession(testSession)
    renderPortal()
    expect(screen.getByRole('heading', { name: /Hola, Ana/ })).toBeInTheDocument()
    expect(screen.getByText('Así va tu ropa.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tu ropa limpia, cuidada y lista cuando la necesitas.' })).toBeInTheDocument()
    expect(screen.getByText('SeLava · Lavandería y Dry Clean')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'No tienes pedidos activos.' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    expect(screen.queryByText(/SLV-0249|Q145|María/)).not.toBeInTheDocument()
  })

  it('incluye los enlaces del prototipo y marca Inicio como página actual', () => {
    useClientSession.getState().setSession(testSession)
    renderPortal()
    const navigation = within(screen.getByRole('navigation', { name: 'Navegación principal' }))
    for (const [label, href] of [['Inicio', '/inicio'], ['Mis pedidos', '/mis-pedidos'], ['Pagos', '/pagos'], ['Mi perfil', '/mi-perfil']]) {
      expect(navigation.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
    expect(navigation.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'SeLava, ir al inicio' })).toHaveAttribute('href', '/inicio')
  })

  it('lleva el CTA a la ruta preparada para los pedidos del cliente', async () => {
    const user = userEvent.setup()
    useClientSession.getState().setSession(testSession)
    renderPortal()
    await user.click(screen.getByRole('link', { name: 'Ver mis pedidos' }))
    expect(screen.getByRole('heading', { name: 'Mis pedidos.' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Aún no tienes pedidos.' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Inicio' }))
    expect(screen.getByRole('heading', { name: /Hola, Ana/ })).toBeInTheDocument()
  })

  it('permite abrir directamente el portal autenticado en /inicio', () => {
    useClientSession.getState().setSession(testSession)
    renderPortal('/inicio')
    expect(screen.getByRole('heading', { name: /Hola, Ana/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(document.title).toBe('Mi portal | SELAVA')
  })

  it('presenta saludo, avatar y CTA personal para la sesión real', () => {
    useClientSession.getState().setSession(testSession)
    renderPortal()
    expect(screen.getByRole('heading', { name: /Hola, Ana/ })).toBeInTheDocument()
    expect(screen.getByText('Así va tu ropa.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Perfil de Ana Pérez' })).toHaveTextContent('AP')
    expect(screen.getByRole('link', { name: 'Ver mis pedidos' })).toHaveAttribute('href', '/mis-pedidos')
  })

  it('muestra cada pedido activo en su propia tarjeta con estado, fecha, total, saldo y detalle', async () => {
    getOwnOrdersMock.mockResolvedValue({
      pedidos: [
        { id: 12, fecha_recibido: '2026-10-10T10:00:00Z', total: 45, total_pagado: 20, saldo_pendiente: 25, en_proceso: true, tipos_prenda: ['Camisa'], estado_actual: { id: 2, nombre: 'Rackeado', orden: 2 } },
        { id: 10, fecha_recibido: '2026-10-08T10:00:00Z', total: 30, total_pagado: 30, saldo_pendiente: 0, en_proceso: true, estado_actual: { id: 1, nombre: 'Recibido', orden: 1 } },
        // Un pedido que acaba de finalizar ya no debe mostrarse aunque llegue en la respuesta.
        { id: 9, fecha_recibido: '2026-10-07T10:00:00Z', total: 30, total_pagado: 30, saldo_pendiente: 0, en_proceso: false, estado_actual: { id: 6, nombre: 'Finalizado', orden: 6, es_terminal: true } },
      ], total: 3, pagina: 1, limite: 100,
    })
    useClientSession.getState().setSession(testSession)
    renderPortal()
    const first = within((await screen.findByRole('heading', { name: 'SLV-0012' })).closest('article')!)
    expect(first.getByRole('status', { name: 'Estado actual: Rackeado' })).toBeInTheDocument()
    expect(first.getByText(/recibido el/i)).toBeInTheDocument()
    expect(first.getByText(/Q\s?45[.,]00/)).toBeInTheDocument()
    expect(first.getByText('Saldo pendiente')).toBeInTheDocument()
    expect(first.getByText(/Q\s?25[.,]00/)).toBeInTheDocument()
    expect(first.getByRole('link', { name: 'Ver detalle de SLV-0012' })).toHaveAttribute('href', '/mis-pedidos/12')
    const second = within(screen.getByRole('heading', { name: 'SLV-0010' }).closest('article')!)
    expect(second.getByText('Al día')).toBeInTheDocument()
    expect(second.getByRole('link', { name: 'Ver detalle de SLV-0010' })).toHaveAttribute('href', '/mis-pedidos/10')
    expect(screen.queryByRole('heading', { name: 'SLV-0009' })).not.toBeInTheDocument()
    expect(screen.getByText('pedidos activos')).toBeInTheDocument()
    expect(getOwnOrdersMock).toHaveBeenCalledWith(expect.objectContaining({ seccion: 'activos' }), expect.any(AbortSignal))
  })

  it('cierra la sesión y vuelve al formulario de acceso', async () => {
    const user = userEvent.setup()
    useClientSession.getState().setSession(testSession)
    renderPortal()
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('heading', { name: 'Hola de nuevo.' })).toBeInTheDocument()
    expect(useClientSession.getState().session).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
  })

  it('muestra la foto de perfil del cliente en el encabezado', async () => {
    const profileApi = await import('../api/profile')
    vi.mocked(profileApi.getClientProfile).mockResolvedValueOnce({ id: 7, nombre: 'Ana', apellido: 'Pérez', telefono: '5555-1234', email: 'ana@example.com', direccion: 'Zona 1', activo: true, tiene_foto_perfil: true } as never)
    vi.mocked(profileApi.getClientProfilePhoto).mockResolvedValueOnce(new Blob(['x'], { type: 'image/png' }))
    URL.createObjectURL = vi.fn(() => 'blob:foto-ana')
    URL.revokeObjectURL = vi.fn()
    useProfilePhoto.getState().clear()
    useClientSession.getState().setSession(testSession)
    renderPortal()
    const avatar = screen.getByRole('link', { name: /Perfil de/ })
    await waitFor(() => expect(avatar.querySelector('img')).toHaveAttribute('src', 'blob:foto-ana'))
    useProfilePhoto.getState().clear()
  })

  it('permite acceder por teclado al enlace de salto y a Inicio', async () => {
    const user = userEvent.setup()
    useClientSession.getState().setSession(testSession)
    renderPortal()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'SeLava, ir al inicio' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveFocus()
  })

  it.each([
    ['Mis pedidos', 'Mis pedidos.', 'Mis pedidos'],
    ['Pagos', 'Mis pagos.', 'Mis pagos'],
    ['Mi perfil', 'Mi perfil.', 'Mi perfil'],
  ])('permite navegar por teclado a %s sin ocultar el destino', async (label, heading, title) => {
    const user = userEvent.setup()
    useClientSession.getState().setSession(testSession)
    renderPortal()
    const link = screen.getByRole('link', { name: label })
    for (let step = 0; step < 8 && document.activeElement !== link; step++) await user.tab()
    expect(link).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
    expect(document.title).toBe(`${title} | SELAVA`)
    expect(link).toHaveAttribute('aria-current', 'page')
  })
})
