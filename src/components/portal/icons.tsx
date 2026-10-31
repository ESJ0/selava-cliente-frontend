import type { ReactNode, SVGProps } from 'react'

type IconProps = { size?: number; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, 'width' | 'height'>

function icon(paths: ReactNode, defaults: { strokeWidth?: number } = {}) {
  return function Icon({ size = 20, strokeWidth = defaults.strokeWidth ?? 1.9, ...props }: IconProps) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths}</svg>
  }
}

export const HomeIcon = icon(<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />)
export const BagIcon = icon(<><path d="M4 7h16l-1.5 12a2 2 0 0 1-2 1.8h-9a2 2 0 0 1-2-1.8z" /><path d="M9 7a3 3 0 0 1 6 0" /></>)
export const CardIcon = icon(<><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h4" /></>)
export const UserIcon = icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>)
export const BellIcon = icon(<><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" /><path d="M10 20a2 2 0 0 0 4 0" /></>)
export const LogoutIcon = icon(<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h11" /></>)
export const ArrowRightIcon = icon(<path d="M5 12h14M13 6l6 6-6 6" />, { strokeWidth: 2 })
export const ArrowLeftIcon = icon(<path d="M19 12H5M11 6l-6 6 6 6" />, { strokeWidth: 2.2 })
export const ArrowUpRightIcon = icon(<path d="M7 17L17 7M8 7h9v9" />, { strokeWidth: 2.2 })
export const ChevronDownIcon = icon(<path d="M6 9l6 6 6-6" />, { strokeWidth: 2.2 })
export const CheckIcon = icon(<path d="M5 12.5l4.5 4.5L19 7.5" />, { strokeWidth: 3 })
export const ShirtIcon = icon(<path d="M8 3L3 6l2 4 2-1v12h10V9l2 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z" />, { strokeWidth: 1.8 })
export const BasketIcon = icon(<><path d="M3 10h18l-2 10H5z" /><path d="M7 10l3-6M17 10l-3-6M9 14v3M12 14v3M15 14v3" /></>, { strokeWidth: 1.7 })
export const RugIcon = icon(<><rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M4 9h16M4 15h16M2 7v2M2 15v2M22 7v2M22 15v2" /></>, { strokeWidth: 1.7 })
export const TagIcon = icon(<><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="7.5" r="1.5" /></>, { strokeWidth: 1.8 })
export const ClockIcon = icon(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, { strokeWidth: 1.8 })
export const PhoneIcon = icon(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />, { strokeWidth: 2 })
export const SearchIcon = icon(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>, { strokeWidth: 2 })
export const ReceiptIcon = icon(<><path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z" /><path d="M9 8h6M9 12h6M9 16h3" /></>, { strokeWidth: 1.8 })
export const CashIcon = icon(<><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6 9.5v5M18 9.5v5" /></>, { strokeWidth: 1.8 })
export const CopyIcon = icon(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></>, { strokeWidth: 2 })
export const CameraIcon = icon(<><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>, { strokeWidth: 1.8 })
export const UploadIcon = icon(<path d="M12 16V4M6 10l6-6 6 6M4 20h16" />, { strokeWidth: 2 })
export const LockIcon = icon(<><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>)
export const EyeIcon = icon(<><path d="M2.5 12C3.5 10.5 7 6 12 6s8.5 4.5 9.5 6c-1 1.5-4.5 6-9.5 6s-8.5-4.5-9.5-6z" /><circle cx="12" cy="12" r="3" /></>, { strokeWidth: 1.8 })
export const EyeOffIcon = icon(<><path d="M3 3l18 18" /><path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 8.5 4.5 9.5 6-.5.8-1.6 2.2-3.1 3.5M6.5 7.6C4.6 8.9 3.2 10.8 2.5 12c1 1.5 4.5 6 9.5 6 1.6 0 3-.4 4.3-1.1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>, { strokeWidth: 1.8 })
export const SaveIcon = icon(<><path d="M5 4h11l3 3v13H5z" /><path d="M8 4v5h7V4M8 20v-6h8v6" /></>, { strokeWidth: 2 })
export const SpinnerIcon = icon(<path d="M12 3a9 9 0 0 1 9 9" />, { strokeWidth: 2.2 })
export const RefreshIcon = icon(<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" />, { strokeWidth: 2 })
export const TrashIcon = icon(<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>, { strokeWidth: 1.9 })
export const CheckAllIcon = icon(<path d="M2 12.5l4 4L15 7.5M10 16.5l1 1L22 7.5" />, { strokeWidth: 2 })
export const CloseIcon = icon(<path d="M6 6l12 12M18 6L6 18" />, { strokeWidth: 2 })
export const AlertIcon = icon(<><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></>, { strokeWidth: 2 })
export const SparkIcon = icon(<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />, { strokeWidth: 1 })
export const IronIcon = icon(<><path d="M12 3a2 2 0 0 1 2 2c0 1-1 1.5-2 2.2V9l8.5 6a1.5 1.5 0 0 1-.9 2.7H4.4a1.5 1.5 0 0 1-.9-2.7L12 9" /></>, { strokeWidth: 2 })

/** Ícono de servicio inferido por nombre (solo decorativo). */
export function ServiceIcon({ name }: { name: string }) {
  const normalized = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  if (normalized.includes('planch')) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 18h18c0-5-3-8-8-8H8c0 4-2 6-5 8z" /><path d="M9 10V7h9" /></svg>
  if (normalized.includes('sec')) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="12" cy="12" r="4.5" /></svg>
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></svg>
}
