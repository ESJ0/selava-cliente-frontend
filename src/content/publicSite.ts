interface PublicSiteContent {
  businessName: string
  eyebrow: string
  heroTitle: string
  heroDescription: string
  about: { title: string; description: string }
  contact: { phone: string; schedule: string; address: string; mapEmbedUrl: string }
}

export const publicSiteContent: PublicSiteContent = {
  businessName: 'SeLava',
  eyebrow: 'Lavandería y Dry Clean',
  heroTitle: 'Tu ropa limpia, cuidada y lista cuando la necesitas.',
  heroDescription: 'Deja el cuidado de tus prendas en nuestras manos y recupera tiempo para lo que más importa.',
  about: {
    title: 'Una lavandería pensada para cuidar cada detalle',
    description: '',
  },
  contact: {
    phone: '',
    schedule: '',
    address: '',
    mapEmbedUrl: '',
  },
}
