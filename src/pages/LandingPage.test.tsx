import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPublicServices } from '../api/publicServices'
import { AppRoutes } from '../routes/AppRoutes'

vi.mock('../api/publicServices', () => ({ getPublicServices: vi.fn() }))
const getPublicServicesMock = vi.mocked(getPublicServices)

function renderSite(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

beforeEach(() => getPublicServicesMock.mockReset())

describe('sitio público', () => {
  it('muestra la landing en la raíz y enlaza el acceso de clientes', async () => {
    getPublicServicesMock.mockResolvedValue([])
    renderSite()
    expect(screen.getByRole('heading', { name: 'Tu ropa limpia, cuidada y lista cuando la necesitas.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('heading', { name: 'Nuestros servicios y precios' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Una lavandería pensada para cuidar cada detalle' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Contacto y ubicación' })).toBeInTheDocument()
    expect(screen.getByText(/iniciamos nuestras operaciones el 14 de febrero de 2019/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '2474-0193' })).toHaveAttribute('href', 'tel:2474-0193')
    expect(screen.getByText(/Lunes a viernes de 09:00 a 20:00/)).toBeInTheDocument()
    expect(screen.getByText(/Centro Comercial Centro San Juan/)).toBeInTheDocument()
    expect(screen.getByTitle('Ubicación de SeLava en Centro San Juan')).toHaveAttribute('src', expect.stringContaining('google.com/maps/embed'))
    expect(await screen.findByRole('heading', { name: 'El catálogo se está actualizando' })).toBeInTheDocument()
    expect(document.title).toBe('Inicio | SeLava')
  })

  it('presenta el catálogo público con precios y tiempo estimado', async () => {
    getPublicServicesMock.mockResolvedValue([
      { id: 1, nombre: 'Lavado en seco', descripcion: 'Para prendas delicadas', precio_base: 35.5, tiempo_estimado_horas: 24 },
      { id: 2, nombre: 'Planchado', descripcion: null, precio_base: 15, tiempo_estimado_horas: null },
    ])
    renderSite()
    const serviceTitle = await screen.findByRole('heading', { name: 'Lavado en seco' })
    const card = serviceTitle.closest('article')
    expect(card).not.toBeNull()
    expect(within(card!).getByText('Para prendas delicadas')).toBeInTheDocument()
    expect(within(card!).getByText(/Q\s*35\.50/)).toBeInTheDocument()
    expect(within(card!).getByText('Tiempo estimado: 24 h')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Planchado' })).toBeInTheDocument()
  })

  it('permite reintentar cuando el catálogo falla', async () => {
    const user = userEvent.setup()
    getPublicServicesMock.mockRejectedValueOnce(new Error('fallo')).mockResolvedValueOnce([])
    renderSite()
    await user.click(await screen.findByRole('button', { name: 'Intentar de nuevo' }))
    await waitFor(() => expect(getPublicServicesMock).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole('heading', { name: 'El catálogo se está actualizando' })).toBeInTheDocument()
  })

  it('abre una pantalla honesta mientras la autenticación está pendiente', () => {
    getPublicServicesMock.mockResolvedValue([])
    renderSite('/login')
    expect(screen.getByRole('heading', { name: 'Acceso de clientes' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al sitio público' })).toHaveAttribute('href', '/')
  })
})
