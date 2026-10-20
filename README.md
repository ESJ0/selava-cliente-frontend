# SeLava · Portal cliente

Frontend público y portal de clientes de SeLava, construido con React 19,
TypeScript 6 y Vite 8. Usa React Router, Zustand, Axios, Vitest y React Testing
Library.

## Desarrollo

Requiere Node.js 22.22.2 o superior y npm 11 o superior.

```sh
npm ci
```

Copia `.env.example` a `.env` y configura `VITE_API_URL` con la base de la API,
incluyendo `/api` (por defecto `http://localhost:8080/api`). Las variables
`VITE_*` son públicas y nunca deben contener secretos.

```sh
npm run dev
```

El sitio se abre en `http://localhost:5174/`. Vite usa el puerto 5174 estricto
para evitar conflictos con el frontend administrativo. El backend debe permitir
este origen, por ejemplo:
`ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174`.

## Rutas principales

- `/`: Landing Page pública.
- `/login`: formulario de inicio de sesión conectado a la API de clientes.
- `/registro`: formulario para crear el perfil y la cuenta de cliente.
- `/inicio`: Home privado del portal de clientes.
- `/mis-pedidos`: listado de pedidos propios; cada pedido abre su detalle y
  seguimiento cronológico.
- `/pagos`, `/mi-perfil` y `/servicios`: rutas preparadas del portal de clientes.

La entrada principal `/` muestra primero la landing. Su botón **Iniciar sesión**
abre `/login`; las rutas del portal redirigen allí cuando no existe una sesión.

La sección pública de precios consume `GET /api/public/tipos-prenda` sin enviar
JWT. Presenta tipos activos con `id`, `nombre`, `descripcion` y `precio` en GTQ;
los tipos pendientes de configurar se excluyen en el backend. Los servicios ya no
se presentan como fuente de precio. Requiere backend SEL-107 con migración 023. El servidor de despliegue debe redirigir las rutas del frontend a
`index.html` para admitir enlaces directos con `BrowserRouter`.

## Contenido público

La historia, el teléfono, el horario, la dirección y la URL del mapa se mantienen
centralizados en `src/content/publicSite.ts`. Los precios por tipo de prenda proceden
siempre del endpoint público y no se duplican en el frontend.

El registro consume `POST /api/auth/clientes/registro`. El login usa
`POST /api/auth/clientes/login` y comprueba el JWT recibido mediante
`GET /api/cliente/me` antes de guardar la sesión. El token se conserva en
`sessionStorage`, por lo que se elimina al cerrar la pestaña; las contraseñas
nunca se almacenan.

Los pedidos consumen exclusivamente las rutas privadas `/api/cliente/pedidos`.
El detalle presenta el precio congelado de la prenda para SEL-107 y conserva los
importes históricos por servicio cuando no existe esa instantánea.
SEL-108 presenta la tarifa pública según `modalidad_cobro` y la medida del pedido
según `modalidad_cobro_aplicada` y `cantidad`. Si la modalidad histórica falta,
conserva UNIDAD y nunca toma la modalidad actual del catálogo. El subtotal se
muestra desde `prendas[].subtotal` de lectura del backend #42 y el total desde
`pedido.total`; el cliente no reconstruye ninguno de esos importes. Un backend
anterior sin subtotal muestra «No disponible» en esa fila.
El listado, detalle, historial y tarjeta de pedido activo incluyen estados de
carga, vacío y error, y nunca envían un `cliente_id` desde el navegador.

## Validación

```sh
npm run lint
npm test
npm run typecheck
npm run build
npm run preview
```

La arquitectura, los puntos de edición y la matriz de pruebas responsivas se
documentan en [`docs/sitio-publico.md`](docs/sitio-publico.md).
