import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ClientLayout } from '../layouts/ClientLayout'
import { HomePage } from '../pages/HomePage'
import { UpcomingPage } from '../pages/UpcomingPage'
import { NotFoundPage } from '../pages/NotFoundPage'

const upcoming = [
  { path: '/mis-pedidos', title: 'Mis pedidos', description: 'Pronto podrás consultar el seguimiento de tus pedidos al acceder a tu cuenta.' },
  { path: '/pagos', title: 'Mis pagos', description: 'Pronto podrás consultar los pagos de tus pedidos al acceder a tu cuenta.' },
  { path: '/mi-perfil', title: 'Mi perfil', description: 'Pronto podrás consultar los datos de tu cuenta.' },
  { path: '/servicios', title: 'Nuestros servicios', description: 'Pronto podrás conocer nuestro catálogo y encontrar el cuidado que tus prendas necesitan.' },
]

export function AppRoutes() {
  const { pathname } = useLocation()
  useEffect(() => {
    const title = upcoming.find((page) => page.path === pathname)?.title ?? (pathname === '/inicio' || pathname === '/' ? 'Inicio' : 'Página no encontrada')
    document.title = `${title} | SeLava`
  }, [pathname])
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<HomePage />} />
        {upcoming.map(({ path, title, description }) => <Route key={path} path={path} element={<UpcomingPage title={title} description={description} />} />)}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
