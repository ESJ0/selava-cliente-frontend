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
  it('abre en el inicio con la barra de páginas, accesos y el pie de contacto', async () => {
    const user = userEvent.setup()
    getPublicGarmentTypesMock.mockResolvedValue([])
    renderSite()
    expect(screen.getByRole('heading', { name: 'Tu ropa limpia, cuidada y lista cuando la necesitas.' })).toBeInTheDocument()
    const nav = within(screen.getByRole('navigation', { name: 'Navegación del sitio' }))
    for (const [label, href] of [['Precios', '/precios'], ['Promociones', '/promociones'], ['Nosotros', '/nosotros'], ['Contacto', '/contacto']]) {
      expect(nav.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
    expect(screen.getByRole('link', { name: 'Ver precios por prenda' })).toHaveAttribute('href', '/precios')
    expect(screen.getByRole('heading', { name: '¿Qué estás buscando?' })).toBeInTheDocument()
    // Las secciones ya no van en la misma página.
    expect(screen.queryByRole('heading', { name: 'Precios por tipo de prenda' })).not.toBeInTheDocument()
    expect(screen.queryByTitle('Mapa de Centro Comercial Centro San Juan')).not.toBeInTheDocument()
    const footer = within(screen.getByRole('contentinfo'))
    expect(footer.getByRole('link', { name: 'WhatsApp 3817-4898' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/50238174898\?text=Hola%20SELAVA/)
    expect(footer.getByRole('link', { name: 'Llámanos al 3817-4898' })).toHaveAttribute('href', 'tel:+50238174898')
    expect(footer.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', 'https://www.facebook.com/share/1HSYqFmjnD/')
    expect(footer.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/selava_lavanderia?exln=NDl6cnFtYzg3eDRl')
    expect(footer.getByRole('link', { name: 'Términos y condiciones' })).toHaveAttribute('href', '/terminos')
    expect(document.title).toBe('Inicio | SELAVA')
    await user.click(nav.getAllByRole('link', { name: 'Iniciar sesión' })[0])
    expect(screen.getByRole('heading', { name: 'Hola de nuevo.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear una cuenta' })).toHaveAttribute('href', '/registro')
    expect(document.title).toBe('Iniciar sesión | SELAVA')
  })

  it('lleva a cada página desde la barra y marca la página actual', async () => {
    const user = userEvent.setup()
    getPublicGarmentTypesMock.mockResolvedValue([])
    renderSite()
    const nav = within(screen.getByRole('navigation', { name: 'Navegación del sitio' }))
    await user.click(nav.getByRole('link', { name: 'Precios' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Precios por tipo de prenda' })).toBeInTheDocument()
    expect(nav.getByRole('link', { name: 'Precios' })).toHaveAttribute('aria-current', 'page')
    expect(document.title).toBe('Precios | SELAVA')
    await user.click(nav.getByRole('link', { name: 'Nosotros' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Una lavandería pensada para cuidar cada detalle.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abrimos el 14 de febrero' })).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('redirige los enlaces antiguos de la landing a su página', async () => {
    getPublicGarmentTypesMock.mockResolvedValue([])
    renderSite('/#precios')
    expect(await screen.findByRole('heading', { level: 1, name: 'Precios por tipo de prenda' })).toBeInTheDocument()
  })

  it('en contacto solo muestra horario, estado y mapa; WhatsApp y redes están en el pie', () => {
    renderSite('/contacto')
    const main = within(screen.getByRole('main'))
    expect(main.getByRole('heading', { level: 1, name: 'Pasa a vernos.' })).toBeInTheDocument()
    expect(main.getByRole('status')).toHaveTextContent(/Abierto ahora|Cerrado/)
    expect(main.getByText(/^Lunes a viernes/).closest('li')).toHaveTextContent('Abre9:00 a. m.Cierra8:00 p. m.')
    expect(main.getByText(/^Sábado y domingo/).closest('li')).toHaveTextContent('Abre10:00 a. m.Cierra6:00 p. m.')
    expect(main.getByTitle('Mapa de Centro Comercial Centro San Juan')).toHaveAttribute('src', expect.stringContaining('output=embed'))
    expect(main.getByRole('link', { name: /Cómo llegar/ })).toHaveAttribute('href', expect.stringContaining('google.com/maps/dir'))
    expect(main.queryByRole('link', { name: /WhatsApp/ })).not.toBeInTheDocument()
    expect(main.queryByRole('link', { name: /Llamar|Llámanos/ })).not.toBeInTheDocument()
    expect(main.queryByRole('link', { name: 'Facebook' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'WhatsApp' })).toBeInTheDocument()
    expect(document.title).toBe('Contacto | SELAVA')
  })

  it('muestra carga mientras obtiene los precios por prenda', async () => {
    let resolveCatalog!: (value: []) => void
    getPublicGarmentTypesMock.mockReturnValueOnce(new Promise(resolve => { resolveCatalog = resolve }))
    renderSite('/precios')
    expect(screen.getByText('Cargando precios por tipo de prenda')).toBeInTheDocument()
    resolveCatalog([])
    expect(await screen.findByRole('heading', { name: 'El catálogo se está actualizando' })).toBeInTheDocument()
    expect(screen.queryByText('Cargando precios por tipo de prenda')).not.toBeInTheDocument()
  })

  it('presenta precios por prenda sin tarifas propias de servicios', async () => {
    getPublicGarmentTypesMock.mockResolvedValue([
      { id: 1, nombre: 'Camisa', descripcion: 'Para prendas delicadas', precio: 35.5, modalidad_cobro: 'UNIDAD' },
      { id: 2, nombre: 'Pantalón', descripcion: null, precio: 15, modalidad_cobro: 'UNIDAD' },
    ])
    renderSite('/precios')
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
    renderSite('/precios')
    for (const [name, rate] of [['Prenda A', /Q\s*25\s*por unidad/], ['Prenda B', /Q\s*12\s*por libra/], ['Prenda C', /Q\s*18\.50\s*por metro/]] as const) {
      const heading = await screen.findByRole('heading', { name })
      expect(heading.closest('article')).toHaveTextContent(rate)
    }
  })

  it('permite reintentar cuando el catálogo falla', async () => {
    const user = userEvent.setup()
    getPublicGarmentTypesMock.mockRejectedValueOnce(new Error('fallo')).mockResolvedValueOnce([])
    renderSite('/precios')
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
    expect(document.title).toBe('Iniciar sesión | SELAVA')
  })

  it('muestra las promociones vigentes del backend, las más nuevas primero', async () => {
    getPublicGarmentTypesMock.mockResolvedValue([{ id: 5, nombre: 'Alfombra', descripcion: null, precio: 40, modalidad_cobro: 'METRO' }])
    getPublicPromotionsMock.mockResolvedValue([promo(3), promo(7, { tipo_prenda_id: 4, tipo_prenda_nombre: 'Canasta', modalidad_cobro: 'LIBRA', medida_requerida: 5, precio_promocional: 50 })])
    renderSite('/promociones')
    const section = await screen.findByRole('region', { name: 'Paga menos por lavar más.' })
    const coupons = within(section).getAllByRole('article')
    expect(coupons.map((coupon) => coupon.getAttribute('aria-label'))).toEqual(['Promo 7', 'Promo 3'])
    expect(within(coupons[1]).getByText('−25%')).toBeInTheDocument()
    expect(coupons[1]).toHaveTextContent('Normalmente pagarías Q80. Te ahorras Q20 en cada paquete de 2 m.')
    expect(within(coupons[1]).getByText('Q40')).toBeInTheDocument()
    expect(document.title).toBe('Promociones | SELAVA')
  })

  it('oculta una promoción cuando el backend deja de devolverla', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      getPublicGarmentTypesMock.mockResolvedValue([])
      getPublicPromotionsMock.mockResolvedValueOnce([promo(3)]).mockResolvedValue([])
      renderSite('/promociones')
      expect(await screen.findByRole('region', { name: 'Paga menos por lavar más.' })).toBeInTheDocument()
      await vi.advanceTimersByTimeAsync(61_000)
      await waitFor(() => expect(screen.queryByRole('region', { name: 'Paga menos por lavar más.' })).not.toBeInTheDocument())
      expect(screen.getByRole('heading', { name: 'Pronto tendremos nuevas promociones.' })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
