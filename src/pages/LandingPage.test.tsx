import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPublicGarmentTypes } from '../api/publicGarmentTypes'
import { getPublicPromotions, type PublicPromotion } from '../api/publicPromotions'
import { AppRoutes } from '../routes/AppRoutes'
import { useClientSession } from '../store/session'

vi.mock('../api/publicGarmentTypes', () => ({ getPublicGarmentTypes: vi.fn() }))
vi.mock('../api/publicPromotions', () => ({ getPublicPromotions: vi.fn() }))
const getPublicGarmentTypesMock = vi.mocked(getPublicGarmentTypes)
const getPublicPromotionsMock = vi.mocked(getPublicPromotions)
const promo = (id: number, extra: Partial<PublicPromotion> = {}): PublicPromotion => ({ id, nombre: `Promo ${id}`, descripcion: '', tipo_prenda_id: 5, tipo_prenda_nombre: 'Alfombra', modalidad_cobro: 'METRO', medida_requerida: 2, precio_promocional: 60, fecha_inicio: '2020-01-01T00:00:00Z', fecha_fin: '2099-12-31T23:00:00Z', ...extra })

function renderSite(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

beforeEach(() => {
  getPublicGarmentTypesMock.mockReset()
  getPublicPromotionsMock.mockReset()
  getPublicPromotionsMock.mockResolvedValue([])
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
    expect(screen.getByRole('heading', { name: 'Pasa a vernos o escríbenos.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abrimos el 14 de febrero' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Llamar al 3817-4898' })).toHaveAttribute('href', 'tel:+50238174898')
    expect(screen.getByText('Lun').closest('li')).toHaveTextContent('9–20')
    expect(screen.getByText('Dom').closest('li')).toHaveTextContent('10–18')
    expect(screen.getByTitle('Mapa de Centro Comercial Centro San Juan')).toHaveAttribute('src', expect.stringContaining('output=embed'))
    expect(screen.getAllByText(/Centro Comercial Centro San Juan/)[0]).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Cómo llegar/ })).toHaveAttribute('href', expect.stringContaining('google.com/maps/dir'))
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', 'https://www.facebook.com/share/1HSYqFmjnD/')
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/selava_lavanderia?exln=NDl6cnFtYzg3eDRl')
    expect(screen.getByRole('link', { name: 'Escribir por WhatsApp al 3817-4898' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/50238174898\?text=Hola%20SELAVA/)
    expect(screen.queryByRole('region', { name: 'Paga menos por lavar más.' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Promociones' })).not.toBeInTheDocument()
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

  it('muestra las promociones vigentes del backend, las más nuevas primero', async () => {
    getPublicGarmentTypesMock.mockResolvedValue([{ id: 5, nombre: 'Alfombra', descripcion: null, precio: 40, modalidad_cobro: 'METRO' }])
    getPublicPromotionsMock.mockResolvedValue([promo(3), promo(7, { tipo_prenda_id: 4, tipo_prenda_nombre: 'Canasta', modalidad_cobro: 'LIBRA', medida_requerida: 5, precio_promocional: 50 })])
    renderSite()
    const section = await screen.findByRole('region', { name: 'Paga menos por lavar más.' })
    const coupons = within(section).getAllByRole('article')
    expect(coupons.map((coupon) => coupon.getAttribute('aria-label'))).toEqual(['Promo 7', 'Promo 3'])
    expect(within(coupons[1]).getByText('−25%')).toBeInTheDocument()
    expect(coupons[1]).toHaveTextContent('Normalmente pagarías Q80. Te ahorras Q20 en cada paquete de 2 m.')
    expect(within(coupons[1]).getByText('Q40')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Promociones' })[0]).toHaveAttribute('href', '#promociones')
    expect(screen.getByText('04 — Estamos para ayudarte')).toBeInTheDocument()
  })

  it('oculta una promoción cuando el backend deja de devolverla', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      getPublicGarmentTypesMock.mockResolvedValue([])
      getPublicPromotionsMock.mockResolvedValueOnce([promo(3)]).mockResolvedValue([])
      renderSite()
      expect(await screen.findByRole('region', { name: 'Paga menos por lavar más.' })).toBeInTheDocument()
      await vi.advanceTimersByTimeAsync(61_000)
      await waitFor(() => expect(screen.queryByRole('region', { name: 'Paga menos por lavar más.' })).not.toBeInTheDocument())
    } finally {
      vi.useRealTimers()
    }
  })
})
