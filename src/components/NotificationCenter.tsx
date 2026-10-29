import { Bell, CheckCheck, ExternalLink, LoaderCircle, RefreshCw, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteOwnNotification, getOwnNotifications, markAllOwnNotificationsRead, markOwnNotificationRead } from '../api/notifications'
import { errorMessage } from '../api/client'
import type { ClientNotification, ClientNotificationsResponse } from '../types/notification'

const dateTime = new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short' })
const POLL_INTERVAL_MS = 30_000

export function NotificationCenter() {
  const navigate = useNavigate()
  const container = useRef<HTMLDivElement>(null)
  const knownIds = useRef(new Set<number>())
  const initialized = useRef(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<ClientNotificationsResponse>({ notificaciones: [], no_leidas: 0 })
  const [toasts, setToasts] = useState<ClientNotification[]>([])

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await getOwnNotifications(signal)
      const newUnread = response.notificaciones.filter((notification) => !notification.leida && !knownIds.current.has(notification.id))
      response.notificaciones.forEach((notification) => knownIds.current.add(notification.id))
      if (!initialized.current) {
        initialized.current = true
        setToasts(response.notificaciones.filter((notification) => !notification.leida).slice(0, 2))
      } else if (newUnread.length) {
        setToasts((current) => [...newUnread, ...current].slice(0, 3))
      }
      setData(response)
      setError('')
    } catch (cause) {
      if (!signal?.aborted) setError(errorMessage(cause))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void refresh(controller.signal)
    const poll = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, POLL_INTERVAL_MS)
    const onFocus = () => void refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      controller.abort()
      window.clearInterval(poll)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOutside)
    return () => document.removeEventListener('mousedown', closeOutside)
  }, [open])

  async function markRead(notification: ClientNotification) {
    if (notification.leida) return
    try {
      await markOwnNotificationRead(notification.id)
      setData((current) => ({
        no_leidas: Math.max(0, current.no_leidas - 1),
        notificaciones: current.notificaciones.map((item) => item.id === notification.id ? { ...item, leida: true } : item),
      }))
      setToasts((current) => current.filter((item) => item.id !== notification.id))
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }

  async function markAllRead() {
    try {
      await markAllOwnNotificationsRead()
      setData((current) => ({ no_leidas: 0, notificaciones: current.notificaciones.map((item) => ({ ...item, leida: true })) }))
      setToasts([])
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }

  async function remove(notification: ClientNotification) {
    try {
      await deleteOwnNotification(notification.id)
      setData((current) => ({
        no_leidas: Math.max(0, current.no_leidas - (notification.leida ? 0 : 1)),
        notificaciones: current.notificaciones.filter((item) => item.id !== notification.id),
      }))
      setToasts((current) => current.filter((item) => item.id !== notification.id))
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }

  async function openOrder(notification: ClientNotification) {
    await markRead(notification)
    if (notification.pedido_id) {
      setOpen(false)
      navigate(`/mis-pedidos/${notification.pedido_id}`)
    }
  }

  return <div className="notification-center" ref={container}>
    <button className="notification-bell" type="button" aria-label={`Notificaciones: ${data.no_leidas} sin leer`} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <Bell size={19} aria-hidden="true"/>{data.no_leidas > 0 && <span>{data.no_leidas > 99 ? '99+' : data.no_leidas}</span>}
    </button>

    {open && <section className="notification-panel" aria-label="Panel de notificaciones">
      <header><div><h2>Notificaciones</h2><p>{data.no_leidas ? `${data.no_leidas} sin leer` : 'Estás al día'}</p></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar notificaciones"><X size={19}/></button></header>
      <div className="notification-toolbar">
        <button type="button" disabled={!data.no_leidas} onClick={() => void markAllRead()}><CheckCheck size={16}/>Marcar todas como leídas</button>
        <button type="button" onClick={() => void refresh()} aria-label="Actualizar notificaciones"><RefreshCw size={16}/></button>
      </div>
      {loading ? <div className="notification-state" role="status"><LoaderCircle className="state-spinner"/>Cargando notificaciones…</div>
        : error ? <div className="notification-state notification-error" role="alert"><p>{error}</p><button type="button" onClick={() => void refresh()}>Reintentar</button></div>
        : !data.notificaciones.length ? <div className="notification-state"><Bell/><p>Aún no tienes notificaciones.</p></div>
        : <ul className="notification-list">{data.notificaciones.map((notification) => <li key={notification.id} className={notification.leida ? 'read' : 'unread'}>
          <button className="notification-content" type="button" onClick={() => void (notification.pedido_id ? openOrder(notification) : markRead(notification))}>
            <span className="notification-dot"/><span><strong>{notification.mensaje}</strong><time dateTime={notification.created_at}>{dateTime.format(new Date(notification.created_at))}</time></span>
            {notification.pedido_id && <ExternalLink size={15} aria-hidden="true"/>}</button>
          <div className="notification-actions">
            {!notification.leida && <button type="button" onClick={() => void markRead(notification)}>Marcar como leída</button>}
            <button type="button" onClick={() => void remove(notification)} aria-label={`Eliminar notificación ${notification.id}`}><Trash2 size={15}/></button>
          </div>
        </li>)}</ul>}
    </section>}

    <div className="notification-toasts" aria-live="polite">{toasts.map((notification) => <article key={notification.id} className="notification-toast">
      <Bell size={19} aria-hidden="true"/><button className="toast-content" type="button" onClick={() => void (notification.pedido_id ? openOrder(notification) : markRead(notification))}><strong>Nueva notificación</strong><span>{notification.mensaje}</span></button>
      <button type="button" aria-label="Cerrar aviso" onClick={() => setToasts((current) => current.filter((item) => item.id !== notification.id))}><X size={16}/></button>
    </article>)}</div>
  </div>
}
