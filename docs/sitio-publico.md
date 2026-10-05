# Estructura del sitio público de SeLava

## Rutas

| Ruta | Propósito | Diseño |
| --- | --- | --- |
| `/` | Landing pública con información comercial | `LandingPage` y `PublicHeader` |
| `/login` | Redirección a `/inicio` para enlaces anteriores | `LoginPage` |
| `/inicio` | Portal de clientes preexistente | `ClientLayout` y `HomePage` |
| `/mis-pedidos`, `/pagos`, `/mi-perfil`, `/servicios` | Rutas preexistentes del portal | `ClientLayout` |

La entrada principal `/` muestra la landing con navegación comercial. El botón
**Iniciar sesión** abre directamente `/inicio`, que usa `ClientLayout` y muestra
el Home de clientes. Este acceso es público; la autenticación real sigue pendiente
de soporte backend.

## Secciones y componentes

- `PublicHeader`: logotipo, enlaces internos a las secciones y acceso a `/inicio`.
- Hero de `LandingPage`: propuesta general y llamada a ver el catálogo.
- `PublicServicesSection`: consume `GET /api/public/servicios` sin autenticación.
  Incluye carga, catálogo vacío, error, reintento y tarjetas con precio base.
- Sobre nosotros: estructura terminada; el texto definitivo está pendiente.
- Contacto y ubicación: admite teléfono, horario, dirección y mapa embebido.
- Footer: navegación secundaria a las secciones públicas.
- `LoginPage`: redirige `/login` a `/inicio` sin añadir una pantalla intermedia al
  historial ni crear una sesión.

## Contenido editable

Los datos comerciales están centralizados en `src/content/publicSite.ts`:

- `about.description`;
- `contact.phone`;
- `contact.schedule`;
- `contact.address`;
- `contact.mapEmbedUrl` con una URL de inserción permitida por el proveedor del mapa.

Los servicios y precios no se editan en ese archivo: siempre proceden del endpoint
público. La moneda se presenta como quetzales (`GTQ`) y el precio se etiqueta como
base, conforme al nombre `precio_base` del contrato.

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
