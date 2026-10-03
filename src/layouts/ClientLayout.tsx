import { Outlet } from 'react-router-dom'
import { ClientHeader } from '../components/ClientHeader'

export function ClientLayout() {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <ClientHeader />
      <main id="contenido" className="page-container" tabIndex={-1}><Outlet /></main>
    </>
  )
}
