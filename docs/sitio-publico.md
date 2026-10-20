# Estructura del sitio público de SeLava

## Rutas

| Ruta | Propósito | Diseño |
| --- | --- | --- |
| `/` | Landing pública con información comercial | `LandingPage` y `PublicHeader` |
| `/login` | Inicio de sesión de clientes | `LoginPage` |
| `/registro` | Registro de perfil y credenciales | `RegisterPage` |
| `/inicio` | Portal privado de clientes | `ProtectedClientRoute`, `ClientLayout` y `HomePage` |
| `/mis-pedidos`, `/pagos`, `/mi-perfil`, `/servicios` | Rutas preexistentes del portal | `ClientLayout` |

La entrada principal `/` muestra la landing con navegación comercial. El botón
**Iniciar sesión** abre `/login`. Al autenticar, el cliente recibe un JWT que se
comprueba con la ruta privada de identidad antes de abrir `/inicio`. Las rutas del
portal usan `ProtectedClientRoute` y devuelven al login cuando no hay sesión.

## Secciones y componentes

- `PublicHeader`: logotipo, enlaces internos a las secciones y acceso a `/login`.
- Hero de `LandingPage`: propuesta general y llamada a ver el catálogo.
- `PublicGarmentPricesSection`: consume `GET /api/public/tipos-prenda` sin autenticación.
  Incluye carga, catálogo vacío, error, reintento y tarjetas con el precio por tipo de prenda.
- Sobre nosotros: estructura terminada; el texto definitivo está pendiente.
- Contacto y ubicación: admite teléfono, horario, dirección y mapa embebido.
- Footer: navegación secundaria a las secciones públicas.
- `LoginPage`: valida credenciales, muestra carga y errores, verifica el JWT y
  crea la sesión del cliente.
- `RegisterPage`: valida el perfil y las credenciales, traduce errores del backend
  y conduce al login cuando la cuenta se crea correctamente.

## Contenido editable

Los datos comerciales están centralizados en `src/content/publicSite.ts`:

- `about.description`;
- `contact.phone`;
- `contact.schedule`;
- `contact.address`;
- `contact.mapEmbedUrl` con una URL de inserción permitida por el proveedor del mapa.

Los precios por tipo de prenda no se editan en ese archivo: proceden del endpoint
público, que filtra tipos activos con precio configurado. La moneda se presenta
como quetzales (`GTQ`) con dos decimales, usando `precio` del contrato SEL-107.
No se muestran tarifas propias por servicio.
SEL-108 añade `modalidad_cobro`: UNIDAD, LIBRA y METRO se presentan como «por
unidad», «por libra» y «por metro», respectivamente. Los nombres y tarifas
proceden del backend, sin deducir la modalidad a partir del nombre de la prenda.

En el detalle, `cantidad` representa la medida congelada y se etiqueta con
`modalidad_cobro_aplicada`. El precio es `precio_aplicado` y el subtotal se recibe
del servidor en `subtotal`, sin multiplicación local. Una modalidad ausente
conserva UNIDAD, aunque el catálogo actual indique otra modalidad. El total
siempre es el valor de la respuesta del pedido.

## Comportamiento adaptable

- Escritorio, desde 801 px: navegación completa, hero en dos columnas y catálogo
  de tres tarjetas por fila.
- Tablet, hasta 800 px: navegación interna oculta, hero apilado y catálogo de dos
  tarjetas por fila.
- Móvil, hasta 520 px: catálogo de una columna, CTA a ancho completo y footer
  apilado.
- Los controles interactivos conservan un área mínima de 44 px, hay enlace de
  salto al contenido, foco visible y soporte para `prefers-reduced-motion`.

## Matriz de validación manual

Además de `npm test`, `npm run lint`, `npm run typecheck` y `npm run build`, validar
la versión final en:

| Navegador | Escritorio | Móvil |
| --- | --- | --- |
| Chrome actual | 1440 × 900 y 1024 × 768 | 390 × 844 |
| Edge actual | 1366 × 768 | 412 × 915 |
| Firefox actual | 1440 × 900 | Diseño adaptable a 390 px |
| Safari actual | macOS, 1440 × 900 | iOS, 375 × 812 |

En cada combinación comprobar: navegación por teclado, enlace de inicio de sesión,
anclas internas, carga/error/reintento del catálogo, textos largos, zoom al 200 %,
orientación horizontal y ausencia de desplazamiento horizontal.
