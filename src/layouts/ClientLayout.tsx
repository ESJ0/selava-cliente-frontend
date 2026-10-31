import { Outlet } from 'react-router-dom'
import { ClientHeader } from '../components/ClientHeader'

export function ClientLayout() {
  return (
    <div className="cp-portal">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <ClientHeader />
      <main id="contenido" tabIndex={-1}><Outlet /></main>
    </div>
  )
}
