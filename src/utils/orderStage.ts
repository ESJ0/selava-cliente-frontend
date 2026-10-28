import {
  BadgeCheck,
  Clock3,
  ListChecks,
  PackageCheck,
  Shirt,
  Waves,
  Wind,
  type LucideIcon,
} from 'lucide-react'

type StageIdentity = { codigo?: string; nombre: string }

const iconsByStage: Record<string, LucideIcon> = {
  RECIBIDO: PackageCheck,
  EN_LAVADO: Waves,
  EN_LAVADO_SECO: Wind,
  EN_LAVADO_EN_SECO: Wind,
  EN_PLANCHADO: Shirt,
  RACKEADO: ListChecks,
  FINALIZADO: BadgeCheck,
}

export function orderStageKey(stage: StageIdentity) {
  return (stage.codigo ?? stage.nombre)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export function orderStageIcon(stage: StageIdentity) {
  return iconsByStage[orderStageKey(stage)] ?? Clock3
}
