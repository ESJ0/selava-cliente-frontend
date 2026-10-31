import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { deleteOwnNotification, getOwnNotifications, markAllOwnNotificationsRead, markOwnNotificationRead } from '../api/notifications'
import { errorMessage } from '../api/client'
import type { ClientNotification, ClientNotificationsResponse } from '../types/notification'
import { formatDateTime } from '../utils/portal'
import { BellIcon, CloseIcon, IronIcon, RefreshIcon, SpinnerIcon, TrashIcon } from './portal/icons'

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

  const visible = data.no_leidas > 99 ? '99+' : String(data.no_leidas)
  return <div ref={container}>
    <button className="cp-ib" type="button" aria-label={`Notificaciones: ${data.no_leidas} sin leer`} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <BellIcon className="cp-bell" size={22} />
      {data.no_leidas > 0 && <span className="cp-badge" aria-hidden="true"><span className="cp-ping" /><span className="cp-badge-n">{visible}</span></span>}
    </button>

    {open && <section className="cp-drop" aria-label="Panel de notificaciones">
      <header className="cp-drop-head">
        <div><h2>Notificaciones</h2><p>{data.no_leidas ? `${data.no_leidas} sin leer` : 'Estás al día'}</p></div>
        <div className="cp-drop-tools">
          <button type="button" onClick={() => void refresh()} aria-label="Actualizar notificaciones"><RefreshIcon size={17} /></button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar notificaciones"><CloseIcon size={17} /></button>
        </div>
      </header>
      {loading ? <div className="cp-drop-state" role="status"><SpinnerIcon className="cp-spin" size={24} />Cargando notificaciones…</div>
        : error ? <div className="cp-drop-state" role="alert"><p>{error}</p><button type="button" onClick={() => void refresh()}>Reintentar</button></div>
        : !data.notificaciones.length ? <div className="cp-drop-state"><BellIcon size={28} /><p>Aún no tienes notificaciones.</p></div>
        : <ul className="cp-notes">{data.notificaciones.map((notification) => <li key={notification.id} className={`cp-note ${notification.leida ? 'read' : 'unread'}`}>
          <button className="cp-note-main" type="button" onClick={() => void (notification.pedido_id ? openOrder(notification) : markRead(notification))}>
            <span className="cp-note-ic"><IronIcon size={18} /></span>
            <span className="cp-note-text"><strong>{notification.mensaje}</strong><time dateTime={notification.created_at}>{formatDateTime(notification.created_at)}</time></span>
          </button>
          <div className="cp-note-actions">
            {!notification.leida && <button type="button" onClick={() => void markRead(notification)}>Marcar como leída</button>}
            <button className="cp-del" type="button" onClick={() => void remove(notification)} aria-label={`Eliminar notificación ${notification.id}`}><TrashIcon size={16} /></button>
          </div>
        </li>)}</ul>}
      {!loading && !error && data.notificaciones.length > 0 && (
        <button className="cp-drop-all" type="button" disabled={!data.no_leidas} onClick={() => void markAllRead()}>Marcar todas como leídas</button>
      )}
    </section>}

    {createPortal(<div className="cp-toasts cp-portal-layer" aria-live="polite">{toasts.map((notification) => <article key={notification.id} className="cp-toast">
      <span className="cp-tk2"><BellIcon size={18} /></span>
      <button className="cp-toast-body" type="button" onClick={() => void (notification.pedido_id ? openOrder(notification) : markRead(notification))}><small>Nueva notificación</small><span>{notification.mensaje}</span></button>
      <button className="cp-toast-x" type="button" aria-label="Cerrar aviso" onClick={() => setToasts((current) => current.filter((item) => item.id !== notification.id))}><CloseIcon size={16} /></button>
    </article>)}</div>, document.body)}
  </div>
}
