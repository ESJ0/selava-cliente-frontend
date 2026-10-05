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
- `/login`: pantalla provisional de acceso de clientes.
- `/inicio`: Home preexistente del portal de clientes.
- `/mis-pedidos`, `/pagos`, `/mi-perfil` y `/servicios`: rutas preparadas del
  portal de clientes.

La sección pública de servicios consume `GET /api/public/servicios` sin enviar
JWT. El servidor de despliegue debe redirigir las rutas del frontend a
`index.html` para admitir enlaces directos con `BrowserRouter`.

## Contenido público

La historia, el teléfono, el horario, la dirección y la URL del mapa se mantienen
centralizados en `src/content/publicSite.ts`. Los servicios y precios proceden
siempre del endpoint público y no se duplican en el frontend.

El login real también está pendiente de soporte backend para clientes. La ruta
`/login` no muestra un formulario ni solicita credenciales hasta que exista un
contrato de autenticación válido.

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
