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
    description: 'En SeLava iniciamos nuestras operaciones el 14 de febrero de 2019. Importamos de Italia nuestro equipo de lavado, secado y planchado, y capacitamos continuamente a nuestro personal para cumplir con altos estándares en las técnicas de cuidado profesional de prendas y textiles.\n\nEn 2025 implementamos un sistema novedoso en Guatemala para el cuidado sostenible de prendas, utilizando equipo, insumos y tecnología ecológica, por lo cual recibimos un reconocimiento de sostenibilidad ambiental.\n\nNuestra propuesta de valor es ofrecer servicios profesionales de cuidado de prendas y textiles amigables con el ambiente, cumpliendo con las expectativas de nuestros clientes.',
  },
  contact: {
    phone: '2474-0193',
    schedule: 'Lunes a viernes de 09:00 a 20:00. Sábados y domingos de 10:00 a 18:00.',
    address: '23 avenida 21-54, zona 7, Kaminal Juyú 2, Centro Comercial Centro San Juan, local S1-102.',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.519869163012!2d-90.5543863255145!3d14.62640567644561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8589a139a648a623%3A0x374aec67a3a96d87!2sCentro%20San%20Juan!5e0!3m2!1ses-419!2sgt!4v1791142346873!5m2!1ses-419!2sgt',
  },
}
