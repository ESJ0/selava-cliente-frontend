/**
 * Borrador de Términos y condiciones y Aviso de privacidad de SELAVA.
 * IMPORTANTE: debe revisarlo el negocio (y de preferencia un abogado) antes de publicarse.
 * Si se cambia el texto, actualizar LEGAL_VERSION aquí y TerminosVersionActual en el backend.
 */
export const LEGAL_VERSION = '2026-11'
export const LEGAL_UPDATED = '2 de noviembre de 2026'

export interface LegalSection {
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
}

export interface LegalDocument {
  kicker: string
  title: string
  lead: string
  sections: LegalSection[]
}

const CONTACT = 'por WhatsApp o llamada al 3817-4898, o en nuestro local S1-102 del Centro Comercial Centro San Juan, 23 avenida 21-54, zona 7, Kaminal Juyú 2, Ciudad de Guatemala'

export const TERMS: LegalDocument = {
  kicker: 'Legal',
  title: 'Términos y condiciones',
  lead: 'Estas condiciones explican cómo trabajamos con tus prendas y cómo funciona el portal de clientes de SELAVA. Al crear tu cuenta o dejarnos prendas, aceptas lo que aquí se describe.',
  sections: [
    {
      id: 'quienes-somos',
      title: '1. Quiénes somos',
      paragraphs: [
        `SELAVA, Lavandería y Dry Clean ("SELAVA", "nosotros") presta servicios de lavado, secado, planchado y limpieza en seco. Puedes comunicarte con nosotros ${CONTACT}.`,
      ],
    },
    {
      id: 'servicio',
      title: '2. El servicio',
      items: [
        'Al recibir tus prendas registramos un pedido con su detalle (tipo de prenda, cantidad, color, observaciones y servicios solicitados) y te indicamos el total y la fecha estimada de entrega.',
        'Los precios dependen del tipo de prenda y se cobran por unidad, por libra o por metro, según se muestra en el sitio y en el local. El precio que aplica es el registrado al crear tu pedido.',
        'La fecha de entrega es estimada. Podemos ajustarla si la prenda requiere un cuidado especial; en ese caso te avisaremos por el portal o por teléfono.',
        'Puedes consultar el estado de tus pedidos y pagos en el portal de clientes en cualquier momento.',
      ],
    },
    {
      id: 'recepcion',
      title: '3. Recepción y revisión de prendas',
      items: [
        'Revisamos cada prenda al recibirla y anotamos manchas, roturas, decoloración o desgaste visibles.',
        'Antes de entregarnos tus prendas revisa los bolsillos. SELAVA no se hace responsable por dinero, documentos, joyas u otros objetos olvidados en las prendas; si encontramos alguno, lo guardaremos para devolvértelo.',
        'Algunas manchas (por ejemplo tinta, óxido, grasa antigua o tintes) pueden no salir por completo. Haremos nuestro mejor esfuerzo sin dañar la prenda, pero no podemos garantizar su eliminación total.',
        'Las prendas delicadas, sin etiqueta de cuidado o con adornos (botones especiales, pedrería, piel, encajes) se procesan bajo tu responsabilidad, siguiendo las prácticas recomendadas para su tipo de tela.',
      ],
    },
    {
      id: 'pagos',
      title: '4. Pagos y promociones',
      items: [
        'Puedes pagar tu pedido completo al dejarlo o al recogerlo, o hacer abonos. Para entregarte las prendas, el pedido debe estar pagado en su totalidad.',
        'Aceptamos los métodos de pago disponibles en el local (por ejemplo efectivo, tarjeta o transferencia).',
        'Las promociones aplican por paquete completo, durante su vigencia y según las condiciones publicadas. Lo que no complete un paquete se cobra con la tarifa base. La promoción se confirma al registrar tu pedido y no es acumulable salvo que se indique.',
      ],
    },
    {
      id: 'entrega',
      title: '5. Entrega y prendas no reclamadas',
      items: [
        'Te avisaremos cuando tu pedido esté listo. Puedes recogerlo en nuestro horario de atención presentando el número de pedido o tus datos.',
        'Guardamos las prendas listas durante 30 días calendario a partir de la fecha en que te avisamos que están listas para entrega.',
        'Pasados los 30 días sin que el pedido sea recogido, SELAVA podrá disponer de las prendas (por ejemplo, donarlas) sin obligación de indemnizar, y el cliente sigue siendo responsable del saldo pendiente del servicio.',
        'Antes de disponer de las prendas intentaremos contactarte por los datos registrados en tu cuenta.',
      ],
    },
    {
      id: 'reclamos',
      title: '6. Reclamos por daños o pérdida',
      items: [
        'Revisa tus prendas al recibirlas. Cualquier reclamo debe hacerse en el momento de la entrega o dentro de las 48 horas siguientes, presentando la prenda y el número de pedido.',
        'Si se comprueba que el daño o la pérdida se debió a nuestro proceso, SELAVA podrá repetir el servicio sin costo o compensarte hasta por diez (10) veces el valor cobrado por el servicio de esa prenda.',
        'No somos responsables por daños derivados del desgaste natural, defectos de fabricación, etiquetas de cuidado incorrectas o ausentes, ni por objetos dejados en las prendas.',
      ],
    },
    {
      id: 'cuenta',
      title: '7. Tu cuenta en el portal',
      items: [
        'Para crear tu cuenta debes proporcionar datos verdaderos y mantenerlos actualizados.',
        'Eres responsable de guardar tu contraseña y de la actividad realizada con tu cuenta. Si crees que alguien más la usa, cámbiala desde "Mi perfil" o recupérala con "¿Olvidaste tu contraseña?".',
        'Podemos suspender cuentas usadas de forma indebida o con información falsa.',
      ],
    },
    {
      id: 'cambios',
      title: '8. Cambios a estos términos',
      paragraphs: [
        'Podemos actualizar estos términos. Publicaremos la nueva versión en esta página con su fecha y, si el cambio es importante, te lo haremos saber por el portal o por correo.',
        'Estos términos se rigen por las leyes de la República de Guatemala.',
      ],
    },
  ],
}

export const PRIVACY: LegalDocument = {
  kicker: 'Legal',
  title: 'Aviso de privacidad',
  lead: 'Cuidamos tus datos como cuidamos tu ropa. Aquí explicamos qué información guardamos, para qué la usamos y cómo puedes pedir que la cambiemos o la eliminemos.',
  sections: [
    {
      id: 'datos',
      title: '1. Qué datos guardamos',
      items: [
        'Datos de contacto: nombre, apellido, teléfono, correo electrónico y dirección.',
        'Datos de facturación: NIT (o "CF").',
        'Foto de perfil, si decides subir una.',
        'Datos de tus pedidos y pagos: prendas, servicios, montos, abonos y estados.',
        'Datos de acceso: correo, contraseña (guardada cifrada; nadie en SELAVA puede verla) y la fecha en que aceptaste estos documentos.',
      ],
    },
    {
      id: 'uso',
      title: '2. Para qué los usamos',
      items: [
        'Registrar y dar seguimiento a tus pedidos, cobros y entregas.',
        'Avisarte sobre el estado de tus pedidos y responder tus consultas.',
        'Enviarte correos necesarios del servicio, como la recuperación de tu contraseña.',
        'Emitir comprobantes con tu NIT cuando lo solicites.',
        'Mejorar nuestro servicio con reportes internos que no te identifican individualmente.',
      ],
    },
    {
      id: 'compartir',
      title: '3. Con quién los compartimos',
      paragraphs: [
        'No vendemos ni alquilamos tus datos. Solo los compartimos con proveedores que nos ayudan a operar (por ejemplo, el servicio de correo o el alojamiento del sistema), con autoridades cuando la ley lo exija, o con tu autorización.',
      ],
    },
    {
      id: 'seguridad',
      title: '4. Cómo los protegemos',
      items: [
        'Las contraseñas se guardan cifradas y los enlaces de recuperación vencen en 30 minutos y se usan una sola vez.',
        'Solo el personal autorizado de SELAVA puede consultar tu información, según su función.',
      ],
    },
    {
      id: 'conservacion',
      title: '5. Cuánto tiempo los conservamos',
      paragraphs: [
        'Conservamos tus datos mientras tengas una cuenta activa o pedidos pendientes, y el tiempo necesario para cumplir obligaciones contables y fiscales.',
      ],
    },
    {
      id: 'derechos',
      title: '6. Tus derechos',
      items: [
        'Consultar y actualizar tus datos desde "Mi perfil".',
        'Eliminar tu foto de perfil cuando quieras.',
        `Pedir la corrección o eliminación de tu cuenta ${CONTACT}.`,
      ],
    },
    {
      id: 'contacto-privacidad',
      title: '7. Contacto',
      paragraphs: [`Si tienes dudas sobre este aviso, escríbenos ${CONTACT}.`],
    },
  ],
}
