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
    schedule: { days: string; hours: string }[]
    addressLines: string[]
    place: string
    placeDetail: string
    mapUrl: string
    socials: { label: string; href: string }[]
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
    schedule: [
      { days: 'Lunes a viernes', hours: '09:00 – 20:00' },
      { days: 'Sábados y domingos', hours: '10:00 – 18:00' },
    ],
    addressLines: ['23 avenida 21-54, zona 7, Kaminal Juyú 2.', 'Centro Comercial Centro San Juan, local S1-102.'],
    place: 'Centro San Juan',
    placeDetail: 'Local S1-102 · Zona 7',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Centro+Comercial+Centro+San+Juan+zona+7+Guatemala',
    socials: [
      { label: 'Facebook', href: '#facebook' },
      { label: 'Instagram', href: '#instagram' },
      { label: 'TikTok', href: '#tiktok' },
      { label: 'WhatsApp', href: '#whatsapp' },
    ],
  },
}
