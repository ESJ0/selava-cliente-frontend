interface Milestone {
  year: string
  title: string
  description: string
  current?: boolean
}

interface PublicSiteContent {
  businessName: string
  eyebrow: string
  heroDescription: string
  ribbon: string[]
  about: { title: string; highlight: string; description: string; milestones: Milestone[] }
  contact: {
    phone: string
    whatsapp: string
    whatsappMessage: string
    week: { day: string; open: number; close: number }[]
    schedule: { days: string; hours: string }[]
    addressLines: string[]
    place: string
    placeDetail: string
    mapQuery: string
    socials: { label: 'Facebook' | 'Instagram' | 'WhatsApp'; href: string }[]
  }
}

export const publicSiteContent: PublicSiteContent = {
  businessName: 'SeLava',
  eyebrow: 'Lavandería y Dry Clean · Guatemala',
  heroDescription: 'Deja el cuidado de tus prendas en nuestras manos y recupera tiempo para lo que más importa.',
  ribbon: ['Lavado', 'Secado', 'Planchado', 'Dry clean', 'Equipo italiano', 'Cuidado sostenible'],
  about: {
    title: 'Una lavandería pensada para cuidar',
    highlight: 'cada detalle.',
    description: 'Ofrecemos servicios profesionales de cuidado de prendas y textiles, amigables con el ambiente, cumpliendo con las expectativas de nuestros clientes.',
    milestones: [
      {
        year: '2019',
        title: 'Abrimos el 14 de febrero',
        description: 'Importamos de Italia nuestro equipo de lavado, secado y planchado, y capacitamos continuamente a nuestro personal en técnicas de cuidado profesional de prendas y textiles.',
      },
      {
        year: '2025',
        title: 'Cuidado sostenible, reconocido',
        description: 'Implementamos un sistema novedoso en Guatemala con equipo, insumos y tecnología ecológica, y recibimos un reconocimiento de sostenibilidad ambiental.',
      },
      {
        year: 'Hoy',
        title: 'Tu tiempo, de vuelta',
        description: 'Recibimos tus prendas, las tratamos como propias y te las entregamos listas para usar.',
        current: true,
      },
    ],
  },
  contact: {
    phone: '2474-0193',
    whatsapp: '3817-4898',
    whatsappMessage: 'Hola SELAVA, quisiera información sobre sus servicios de lavandería.',
    week: [
      { day: 'Lunes', open: 9, close: 20 },
      { day: 'Martes', open: 9, close: 20 },
      { day: 'Miércoles', open: 9, close: 20 },
      { day: 'Jueves', open: 9, close: 20 },
      { day: 'Viernes', open: 9, close: 20 },
      { day: 'Sábado', open: 10, close: 18 },
      { day: 'Domingo', open: 10, close: 18 },
    ],
    schedule: [
      { days: 'Lunes a viernes', hours: '09:00 – 20:00' },
      { days: 'Sábados y domingos', hours: '10:00 – 18:00' },
    ],
    addressLines: ['23 avenida 21-54, zona 7, Kaminal Juyú 2.', 'Centro Comercial Centro San Juan, local S1-102.'],
    place: 'Centro Comercial Centro San Juan',
    placeDetail: 'Local S1-102',
    mapQuery: 'Centro Comercial Centro San Juan, 23 avenida 21-54, zona 7, Ciudad de Guatemala',
    socials: [
      { label: 'Facebook', href: 'https://www.facebook.com/share/1HSYqFmjnD/' },
      { label: 'Instagram', href: 'https://www.instagram.com/selava_lavanderia?exln=NDl6cnFtYzg3eDRl' },
    ],
  },
}

const digits = (value: string) => value.replace(/\D/g, '')
/** Enlace para marcar directamente desde el teléfono (código de país de Guatemala). */
export const phoneHref = (phone: string) => `tel:+502${digits(phone)}`
/** Abre el chat de WhatsApp con un mensaje listo para enviar. */
export const whatsappHref = (phone: string, message: string) => `https://wa.me/502${digits(phone)}?text=${encodeURIComponent(message)}`
export const mapsDirectionsHref = (query: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
export const wazeHref = (query: string) => `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`
export const mapsEmbedSrc = (query: string) => `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`
