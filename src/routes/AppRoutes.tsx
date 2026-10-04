import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ClientLayout } from '../layouts/ClientLayout'
import { HomePage } from '../pages/HomePage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { UpcomingPage } from '../pages/UpcomingPage'

const upcoming = [
  { path: '/mis-pedidos', title: 'Mis pedidos', description: 'Pronto podrás consultar el seguimiento de tus pedidos al acceder a tu cuenta.' },
  { path: '/pagos', title: 'Mis pagos', description: 'Pronto podrás consultar los pagos de tus pedidos al acceder a tu cuenta.' },
  { path: '/mi-perfil', title: 'Mi perfil', description: 'Pronto podrás consultar los datos de tu cuenta.' },
  { path: '/servicios', title: 'Nuestros servicios', description: 'Pronto podrás conocer nuestro catálogo y encontrar el cuidado que tus prendas necesitan.' },
]

const standaloneTitles: Record<string, string> = {
  '/': 'Inicio',
  '/inicio': 'Portal de clientes',
  '/login': 'Iniciar sesión',
}

export function AppRoutes() {
  const { pathname } = useLocation()
  useEffect(() => {
    const title = upcoming.find((page) => page.path === pathname)?.title ?? standaloneTitles[pathname] ?? 'Página no encontrada'
    document.title = `${title} | SeLava`
  }, [pathname])
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ClientLayout />}>
        <Route path="/inicio" element={<HomePage />} />
        {upcoming.map(({ path, title, description }) => <Route key={path} path={path} element={<UpcomingPage title={title} description={description} />} />)}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
