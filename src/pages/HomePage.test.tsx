import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../routes/AppRoutes'
import { useClientSession } from '../store/session'

function renderPortal(path = '/inicio') {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

beforeEach(() => useClientSession.getState().clearSession())

describe('Home SEL-94', () => {
  it('muestra bienvenida pública, propuesta y pedido vacío sin fingir sesión', () => {
    renderPortal()
    expect(screen.getByRole('heading', { name: /Bienvenido a SeLava/ })).toBeInTheDocument()
    expect(screen.getByText('Cuidamos tu ropa, tú disfrutas tu día.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tu ropa limpia, cuidada y lista cuando la necesitas.' })).toBeInTheDocument()
    expect(screen.getByText('Lavandería y Dry Clean')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'No tienes pedidos activos.' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
    expect(screen.queryByText(/SLV-0249|Q145|María/)).not.toBeInTheDocument()
  })

  it('incluye los enlaces del prototipo y marca Inicio como página actual', () => {
    renderPortal()
    const navigation = within(screen.getByRole('navigation', { name: 'Navegación principal' }))
    for (const [label, href] of [['Inicio', '/inicio'], ['Mis pedidos', '/mis-pedidos'], ['Pagos', '/pagos'], ['Mi perfil', '/mi-perfil']]) {
      expect(navigation.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
    expect(navigation.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'SeLava, ir al inicio' })).toHaveAttribute('href', '/inicio')
  })

  it('lleva el CTA a una ruta preparada para servicios, sin catálogo simulado', async () => {
    const user = userEvent.setup()
    renderPortal()
    await user.click(screen.getByRole('link', { name: 'Conoce nuestros servicios' }))
    expect(screen.getByRole('heading', { name: 'Nuestros servicios' })).toBeInTheDocument()
    expect(screen.getByText('Próximamente')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Volver al inicio' }))
    expect(screen.getByRole('heading', { name: /Bienvenido a SeLava/ })).toBeInTheDocument()
  })

  it('redirige la raíz a Inicio y permite abrir directamente /inicio', () => {
    renderPortal('/')
    expect(screen.getByRole('heading', { name: /Bienvenido a SeLava/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(document.title).toBe('Inicio | SeLava')
  })

  it('prepara saludo, avatar y CTA personal para una futura sesión real', () => {
    useClientSession.getState().setSession({ customer: { id: 7, nombre: 'Ana', apellido: 'Pérez' }, token: 'test-session-only' })
    renderPortal()
    expect(screen.getByRole('heading', { name: /Hola, Ana/ })).toBeInTheDocument()
    expect(screen.getByText('Así va tu ropa.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Perfil de Ana Pérez' })).toHaveTextContent('AP')
    expect(screen.getByRole('link', { name: 'Ver mis pedidos' })).toHaveAttribute('href', '/mis-pedidos')
  })

  it('cierra la sesión en memoria y devuelve la bienvenida neutra', async () => {
    const user = userEvent.setup()
    useClientSession.getState().setSession({ customer: { id: 7, nombre: 'Ana', apellido: 'Pérez' }, token: 'test-session-only' })
    renderPortal()
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(useClientSession.getState().session).toBeNull()
    expect(screen.getByRole('heading', { name: /Bienvenido a SeLava/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
  })

  it('permite acceder por teclado al enlace de salto y a Inicio', async () => {
    const user = userEvent.setup()
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
    renderPortal()
    const link = screen.getByRole('link', { name: label })
    for (let step = 0; step < 8 && document.activeElement !== link; step++) await user.tab()
    expect(link).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(link).toHaveAttribute('aria-current', 'page')
  })
})
