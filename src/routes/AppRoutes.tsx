import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ClientLayout } from '../layouts/ClientLayout'
import { ProtectedClientRoute } from '../components/ProtectedClientRoute'
import { HomePage } from '../pages/HomePage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OrderDetailPage } from '../pages/OrderDetailPage'
import { OrdersPage } from '../pages/OrdersPage'
import { PaymentsPage } from '../pages/PaymentsPage'
import { RegisterPage } from '../pages/RegisterPage'
import { UpcomingPage } from '../pages/UpcomingPage'

const upcoming = [
  { path: '/mi-perfil', title: 'Mi perfil', description: 'Pronto podrás consultar los datos de tu cuenta.' },
  { path: '/servicios', title: 'Nuestros servicios', description: 'Pronto podrás conocer nuestro catálogo y encontrar el cuidado que tus prendas necesitan.' },
]

const standaloneTitles: Record<string, string> = {
  '/': 'Inicio',
  '/inicio': 'Portal de clientes',
  '/login': 'Iniciar sesión',
  '/recuperar-contrasena': 'Recuperar contraseña',
  '/restablecer-contrasena': 'Nueva contraseña',
  '/registro': 'Crear cuenta',
  '/pagos': 'Mis pagos',
}

export function AppRoutes() {
  const { pathname } = useLocation()
  useEffect(() => {
    const title = pathname.startsWith('/mis-pedidos/')
      ? 'Detalle del pedido'
      : pathname === '/mis-pedidos'
        ? 'Mis pedidos'
        : upcoming.find((page) => page.path === pathname)?.title ?? standaloneTitles[pathname] ?? 'Página no encontrada'
    document.title = `${title} | SeLava`
  }, [pathname])
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
      <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route element={<ProtectedClientRoute />}>
        <Route element={<ClientLayout />}>
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/mis-pedidos" element={<OrdersPage />} />
          <Route path="/mis-pedidos/:pedidoID" element={<OrderDetailPage />} />
          <Route path="/pagos" element={<PaymentsPage />} />
          {upcoming.map(({ path, title, description }) => <Route key={path} path={path} element={<UpcomingPage title={title} description={description} />} />)}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
