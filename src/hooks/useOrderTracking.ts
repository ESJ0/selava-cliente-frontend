import { useCallback, useEffect, useRef, useState } from 'react'
import { getOwnOrderDetail, getOwnOrderHistory } from '../api/orders'
import type { OwnOrderDetail, OwnOrderHistoryEntry } from '../types/order'
import { isActiveOrder } from '../utils/format'

export const ORDER_TRACKING_POLL_INTERVAL_MS = 30_000

type TrackingStatus = 'loading' | 'ready' | 'error'

function isCancelledRequest(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (typeof error !== 'object' || error === null) return false
  const candidate = error as { name?: string; code?: string }
  return candidate.name === 'CanceledError' || candidate.code === 'ERR_CANCELED'
}

export function useOrderTracking(orderId: number) {
  const [detail, setDetail] = useState<OwnOrderDetail | null>(null)
  const [history, setHistory] = useState<OwnOrderHistoryEntry[]>([])
  const [status, setStatus] = useState<TrackingStatus>('loading')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState(false)
  const [requestVersion, setRequestVersion] = useState(0)
  const refreshRef = useRef<() => void>(() => undefined)

  const retry = useCallback(() => setRequestVersion((version) => version + 1), [])
  const refresh = useCallback(() => refreshRef.current(), [])

  useEffect(() => {
    if (!Number.isInteger(orderId) || orderId <= 0) {
      setStatus('error')
      return
    }

    const controller = new AbortController()
    let active = true
    let hasLoaded = false
    let inFlight = false
    let orderIsActive = true

    const load = async (initial: boolean) => {
      if (inFlight || controller.signal.aborted) return
      if (!initial && (!orderIsActive || document.visibilityState !== 'visible')) return

      inFlight = true
      if (initial) setStatus('loading')
      else {
        setRefreshError(false)
        setRefreshing(true)
      }

      try {
        const [order, entries] = await Promise.all([
          getOwnOrderDetail(orderId, controller.signal),
          getOwnOrderHistory(orderId, controller.signal),
        ])
        if (!active || controller.signal.aborted) return
        setDetail(order)
        setHistory(entries)
        setStatus('ready')
        setRefreshError(false)
        hasLoaded = true
        orderIsActive = isActiveOrder(order.estado_actual.nombre)
      } catch (error: unknown) {
        if (!active || isCancelledRequest(error)) return
        if (hasLoaded) setRefreshError(true)
        else setStatus('error')
      } finally {
        if (active) setRefreshing(false)
        inFlight = false
      }
    }

    const requestRefresh = () => { void load(false) }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestRefresh()
    }

    refreshRef.current = requestRefresh
    setRefreshError(false)
    void load(true)
    const intervalID = window.setInterval(requestRefresh, ORDER_TRACKING_POLL_INTERVAL_MS)
    window.addEventListener('focus', requestRefresh)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      active = false
      controller.abort()
      window.clearInterval(intervalID)
      window.removeEventListener('focus', requestRefresh)
      document.removeEventListener('visibilitychange', handleVisibility)
      refreshRef.current = () => undefined
    }
  }, [orderId, requestVersion])

  return { detail, history, status, refreshing, refreshError, retry, refresh }
}
