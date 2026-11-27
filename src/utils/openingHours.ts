import { publicSiteContent } from '../content/publicSite'

type Week = typeof publicSiteContent.contact.week

const pad = (hour: number) => `${String(hour).padStart(2, '0')}:00`
/** Hora legible en formato de 12 horas: 9:00 a. m., 8:00 p. m. */
export const clock12 = (hour: number) => `${hour % 12 || 12}:00 ${hour < 12 ? 'a. m.' : 'p. m.'}`
const rangeLabel = (names: string[]) => names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} y ${names[1].toLowerCase()}` : `${names[0]} a ${names[names.length - 1].toLowerCase()}`

/** Día (0 = lunes) y hora decimal en Guatemala, sin depender de la zona horaria del visitante. */
export function guatemalaClock(now: number) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Guatemala', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date(now))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '0'
  const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday'))
  return { day: Math.max(0, day), hour: Number(get('hour')) + Number(get('minute')) / 60 }
}

/** Estado del local en este momento: abierto o cerrado y cuándo cambia. */
export function openStatus(now: number, week: Week = publicSiteContent.contact.week) {
  const { day, hour } = guatemalaClock(now)
  const today = week[day]
  const next = week[(day + 1) % 7]
  const open = hour >= today.open && hour < today.close
  const text = open ? `Abierto ahora · cierra a las ${pad(today.close)}` : hour < today.open ? `Cerrado · abre hoy a las ${pad(today.open)}` : `Cerrado · abre mañana a las ${pad(next.open)}`
  return { day, open, text }
}

/** Agrupa días consecutivos con el mismo horario: "Lunes a viernes", "Sábado y domingo". */
export function scheduleGroups(week: Week = publicSiteContent.contact.week) {
  return week.reduce<{ label: string; days: number[]; open: number; close: number }[]>((acc, item, index) => {
    const last = acc[acc.length - 1]
    if (last && last.open === item.open && last.close === item.close) last.days.push(index)
    else acc.push({ label: '', days: [index], open: item.open, close: item.close })
    return acc
  }, []).map((group) => ({ ...group, label: rangeLabel(group.days.map((index) => week[index].day)) }))
}
