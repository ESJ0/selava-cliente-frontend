import { useEffect, useState } from 'react'

/** Marca de tiempo que se actualiza cada `everyMs` (horario "abierto ahora", días restantes). */
export function useNow(everyMs = 60_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), everyMs)
    return () => window.clearInterval(interval)
  }, [everyMs])
  return now
}
