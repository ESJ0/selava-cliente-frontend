import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useClientSession } from '../store/session'

export function ProtectedClientRoute() {
  const session = useClientSession((state) => state.session)
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
