import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPublicGarmentTypes } from '../api/publicGarmentTypes'
import { AppRoutes } from '../routes/AppRoutes'
import { useClientSession } from '../store/session'

vi.mock('../api/publicGarmentTypes', () => ({ getPublicGarmentTypes: vi.fn() }))
const getPublicGarmentTypesMock = vi.mocked(getPublicGarmentTypes)

function renderSite(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

beforeEach(() => {
  getPublicGarmentTypesMock.mockReset()
  useClientSession.getState().clearSession()
  sessionStorage.clear()
})

describe('sitio público', () => {
  it('muestra carga mientras obtiene los precios por prenda', async () => {
    let resolveCatalog!: (value: []) => void
    getPublicGarmentTypesMock.mockReturnValueOnce(new Promise(resolve => { resolveCatalog = resolve }))
    renderSite()
    expect(screen.getByText('Cargando precios por tipo de prenda')).toBeInTheDocument()
    resolveCatalog([])
    expect(await screen.findByRole('heading', { name: 'El catálogo se está actualizando' })).toBeInTheDocument()
    expect(screen.queryByText('Cargando precios por tipo de prenda')).not.toBeInTheDocument()
  })
  it('muestra primero la landing y abre el formulario al pulsar Iniciar sesión', async () => {
    const user = userEvent.setup()
    getPublicGarmentTypesMock.mockResolvedValue([])
    renderSite()
    expect(screen.getByRole('heading', { name: 'Tu ropa limpia, cuidada y lista cuando la necesitas.' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Bienvenido a SeLava/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('heading', { name: 'Precios por tipo de prenda' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Una lavandería pensada para cuidar cada detalle.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Contacto y ubicación' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abrimos el 14 de febrero' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '2474-0193' })).toHaveAttribute('href', 'tel:24740193')
    expect(screen.getByText('Lunes a viernes').parentElement).toHaveTextContent('09:00 – 20:00')
    expect(screen.getByText(/Centro Comercial Centro San Juan/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cómo llegar' })).toHaveAttribute('href', expect.stringContaining('google.com/maps'))
    expect(await screen.findByRole('heading', { name: 'El catálogo se está actualizando' })).toBeInTheDocument()
    expect(document.title).toBe('Inicio | SeLava')
    await user.click(screen.getByRole('link', { name: 'Iniciar sesión' }))
    expect(screen.getByRole('heading', { name: 'Hola de nuevo.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear una cuenta' })).toHaveAttribute('href', '/registro')
    expect(document.title).toBe('Iniciar sesión | SeLava')
  })

  it('presenta precios por prenda sin tarifas propias de servicios', async () => {
    getPublicGarmentTypesMock.mockResolvedValue([
      { id: 1, nombre: 'Camisa', descripcion: 'Para prendas delicadas', precio: 35.5, modalidad_cobro: 'UNIDAD' },
      { id: 2, nombre: 'Pantalón', descripcion: null, precio: 15, modalidad_cobro: 'UNIDAD' },
    ])
    renderSite()
    const serviceTitle = await screen.findByRole('heading', { name: 'Camisa' })
    const card = serviceTitle.closest('article')
    expect(card).not.toBeNull()
    expect(within(card!).getByText('Para prendas delicadas')).toBeInTheDocument()
    expect(card).toHaveTextContent(/Q\s*35\.50/)
    expect(screen.queryByText(/Tiempo estimado|Desde/)).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Lavado en seco' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pantalón' })).toBeInTheDocument()
  })

  it('presenta la tarifa real por unidad, libra y metro sin inferirla del nombre', async () => {
    getPublicGarmentTypesMock.mockResolvedValue([
      { id: 10, nombre: 'Prenda A', descripcion: null, precio: 25, modalidad_cobro: 'UNIDAD' },
      { id: 11, nombre: 'Prenda B', descripcion: null, precio: 12, modalidad_cobro: 'LIBRA' },
      { id: 12, nombre: 'Prenda C', descripcion: null, precio: 18.5, modalidad_cobro: 'METRO' },
    ])
    renderSite()
    for (const [name, rate] of [['Prenda A', /Q\s*25\s*por unidad/], ['Prenda B', /Q\s*12\s*por libra/], ['Prenda C', /Q\s*18\.50\s*por metro/]] as const) {
      const heading = await screen.findByRole('heading', { name })
      expect(heading.closest('article')).toHaveTextContent(rate)
    }
  })

  it('permite reintentar cuando el catálogo falla', async () => {
    const user = userEvent.setup()
    getPublicGarmentTypesMock.mockRejectedValueOnce(new Error('fallo')).mockResolvedValueOnce([])
    renderSite()
    await user.click(await screen.findByRole('button', { name: 'Intentar de nuevo' }))
    await waitFor(() => expect(getPublicGarmentTypesMock).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole('heading', { name: 'El catálogo se está actualizando' })).toBeInTheDocument()
  })

  it('presenta el formulario real al abrir /login', () => {
    getPublicGarmentTypesMock.mockResolvedValue([])
    renderSite('/login')
    expect(screen.getByRole('heading', { name: 'Hola de nuevo.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(document.title).toBe('Iniciar sesión | SeLava')
  })
})
