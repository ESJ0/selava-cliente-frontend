import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../routes/AppRoutes'
import { useClientSession } from '../store/session'

function renderPortal(path = '/inicio') {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

const testSession = { customer: { id: 7, nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com' }, token: 'test-session-only' }

beforeEach(() => {
  useClientSession.getState().clearSession()
  sessionStorage.clear()
})

describe('Home SEL-94', () => {
  it('redirige al login cuando no existe una sesión de cliente', () => {
    renderPortal()
    expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).not.toBeInTheDocument()
  })

  it('muestra propuesta y pedido vacío con una sesión válida', () => {
    useClientSession.getState().setSession(testSession)
    renderPortal()
    expect(screen.getByRole('heading', { name: /Hola, Ana/ })).toBeInTheDocument()
    expect(screen.getByText('Así va tu ropa.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tu ropa limpia, cuidada y lista cuando la necesitas.' })).toBeInTheDocument()
    expect(screen.getByText('Lavandería y Dry Clean')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'No tienes pedidos activos.' })).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: 'Mis pedidos' })).toBeInTheDocument()
    expect(screen.getByText('Próximamente')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Volver al inicio' }))
    expect(screen.getByRole('heading', { name: /Hola, Ana/ })).toBeInTheDocument()
  })

  it('permite abrir directamente el portal autenticado en /inicio', () => {
    useClientSession.getState().setSession(testSession)
    renderPortal('/inicio')
    expect(screen.getByRole('heading', { name: /Hola, Ana/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(document.title).toBe('Portal de clientes | SeLava')
  })

  it('presenta saludo, avatar y CTA personal para la sesión real', () => {
    useClientSession.getState().setSession(testSession)
    renderPortal()
    expect(screen.getByRole('heading', { name: /Hola, Ana/ })).toBeInTheDocument()
    expect(screen.getByText('Así va tu ropa.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Perfil de Ana Pérez' })).toHaveTextContent('AP')
    expect(screen.getByRole('link', { name: 'Ver mis pedidos' })).toHaveAttribute('href', '/mis-pedidos')
  })

  it('cierra la sesión y vuelve al formulario de acceso', async () => {
    const user = userEvent.setup()
    useClientSession.getState().setSession(testSession)
    renderPortal()
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(useClientSession.getState().session).toBeNull()
    expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
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
    ['Mis pedidos', 'Mis pedidos'],
    ['Pagos', 'Mis pagos'],
    ['Mi perfil', 'Mi perfil'],
  ])('permite navegar por teclado a %s sin ocultar el destino', async (label, title) => {
    const user = userEvent.setup()
    useClientSession.getState().setSession(testSession)
    renderPortal()
    const link = screen.getByRole('link', { name: label })
    for (let step = 0; step < 8 && document.activeElement !== link; step++) await user.tab()
    expect(link).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(link).toHaveAttribute('aria-current', 'page')
  })
})
