# SeLava · Portal cliente

Base del portal y Home de SEL-94, siguiendo las capturas del prototipo. React 19,
TypeScript 6 y Vite 8, con React Router, Zustand y Axios como el frontend administrativo.
Estilos CSS, ESLint y pruebas con Vitest + React Testing Library.

## Desarrollo

Requiere Node.js 22.22.2 o superior y npm 11 o superior.

```sh
npm ci
```

Copia `.env.example` a `.env`. Configura `VITE_API_URL` con la base de la API,
incluyendo `/api` (por defecto `http://localhost:8080/api`). `.env` está ignorado;
las variables `VITE_*` son públicas y nunca deben contener secretos.

```sh
npm run dev
```

Abre `http://localhost:5174/inicio`. Vite usa el puerto 5174 estricto para evitar
conflictos con el admin. Configura en el backend:
`ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174`.
No se usa proxy, por lo que las peticiones ejercitan la configuración CORS real.

## Validación

```sh
npm run lint
npm test
npm run typecheck
npm run build
npm run preview
```

El build queda en `dist/`. El servidor de despliegue debe redirigir las rutas
del portal a `index.html` para admitir enlaces directos con BrowserRouter.

## Alcance actual

`/` redirige a `/inicio`. La Home incluye bienvenida neutra, propuesta de valor
y CTA; el pedido activo muestra un estado vacío, sin datos simulados.
`/mis-pedidos`, `/pagos`, `/mi-perfil` y `/servicios` son únicamente placeholders
de navegación. No hay catálogo visual, operaciones de pedidos, pagos ni edición
del perfil. Las otras historias se implementarán por separado.

**Login de cliente pendiente de soporte backend.** El backend actual solo tiene
`POST /api/auth/login` para `Usuario`; `Cliente` tiene email, pero no contraseña,
relación con usuario ni rol Cliente. El JWT contiene `usuario_id` y `rol_id`
(Administrador, Recepcionista, Operario). No se consume ese login como si fuera
de clientes. La Home permanece pública; no se crea `/login` ni una protección
aparente. `store/session.ts` prepara una sesión futura en memoria, sin persistir
tokens ni crear credenciales. Ninguna pantalla establece una sesión actualmente.
El saludo, avatar y cierre local solo se muestran si una integración futura
entrega una sesión real.

## Estructura mínima

- `api/`: cliente HTTP público, instancia preparada para JWT futuro, errores humanos
  y `getPublicServices()` para `GET /api/public/servicios` de SEL-93, sin Authorization.
- `components/`, `layouts/`: header, logo, hero, botones, cards y estado vacío.
- `pages/`, `routes/`: Home, placeholders y rutas del portal.
- `store/`, `types/`: contrato de sesión futura y tipos del catálogo público.
- `styles/`, `test/`: identidad visual y preparación de las pruebas.

El módulo del catálogo está listo para SEL-95; la Home no solicita ni muestra
precios. No se implementan SEL-95, SEL-96, SEL-97, SEL-100 ni SEL-101.

## Responsive (SEL-98)

El CSS usa móvil hasta 639px, tablet de 640 a 1023px y desktop desde 1024px.
En móvil, los cuatro enlaces permanecen visibles en una fila compacta con iconos;
logo y acciones de sesión conservan áreas táctiles de al menos 44px. Hero, cards
y placeholders ocupan el ancho disponible, con padding de 16px y CTA de ancho
completo. Los textos largos se ajustan sin ocultar contenido ni el overflow global.

Esta historia parte de `feature/sel-94-home-cliente` (`b04a4b0`): SEL-94 sigue
en el PR #1 y `main` aún no contiene la aplicación. SEL-95/96/97 no están
disponibles; no se agregan sus contenidos ni formularios, pagos o timelines.
La validación del responsive actual no sustituye las pruebas formales de SEL-100.
