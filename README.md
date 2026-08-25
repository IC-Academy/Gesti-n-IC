# Gestión IC — Inmuebles e Instalaciones

Portal para el registro, autorización, ejecución y seguimiento de solicitudes de proyectos de mantenimiento, adecuaciones e instalaciones.

Este repositorio contiene únicamente el **frontend** (React + TypeScript + Vite). El backend real (Airtable + n8n) no se conecta directamente desde el navegador: la aplicación incluye una capa de servicios desacoplada que hoy opera en **modo demo** (datos locales persistidos en `localStorage`) y que está preparada para consumir, sin cambios de UI, los webhooks de n8n en **modo API**.

## Índice

- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Usuarios demo](#usuarios-demo)
- [Datos demo incluidos](#datos-demo-incluidos)
- [Arquitectura](#arquitectura)
- [Modo demo vs. modo API](#modo-demo-vs-modo-api)
- [Seguridad](#seguridad)
- [Scripts disponibles](#scripts-disponibles)

## Instalación

Requisitos: Node.js 20+ y npm.

```bash
npm install
npm run dev      # entorno de desarrollo, http://localhost:5173
npm run build    # compilación de producción a /dist
npm run preview  # sirve /dist localmente para verificar el build
```

El proyecto compila sin errores con `npm install && npm run build` (verificado antes de la entrega).

## Variables de entorno

Copia `.env.example` a `.env.local` para personalizar el entorno:

| Variable | Descripción |
| --- | --- |
| `VITE_API_BASE_URL` | URL base del backend (webhooks de n8n). Si se deja vacía, la aplicación opera en **modo demo**. |
| `VITE_APP_MODE` | Fuerza `demo` o `api` sin depender de `VITE_API_BASE_URL`. Opcional. |

**Ningún token, API key o secreto de Airtable vive en este repositorio.** El frontend nunca llama a Airtable directamente: en modo API solo conoce la URL base de los webhooks de n8n, y cualquier credencial de autenticación real se resuelve del lado del servidor.

## Usuarios demo

Todos usan temporalmente la contraseña **`123456`**.

| Usuario | Rol | Nombre |
| --- | --- | --- |
| `90001` | Administrador | Administrador General |
| `20001` | Líder | Diana López |
| `30001` | Jefe de mantenimiento | Roberto Cabrera |
| `10001` | Personal de mantenimiento | Juan Hernández |

El código OTP en modo demo siempre es **`123456`**, tanto para el login interno (si se habilita OTP), como para confirmar una solicitud pública o consultar un estatus.

## Datos demo incluidos

- Solicitud **SOL-2026-0001**, ya `CONVERTIDA_PROYECTO`, con dictamen y prioridad `MEDIA`.
- Proyecto **PRY-2026-0001** ("Adecuación del área de archivo"), `EN_PROCESO`, avance 35%.
- Tres actividades (`ACT-0001` a `ACT-0003`) con distintos pesos, estatus y responsables, dos de ellas asignadas al usuario `10001`.
- Una nueva solicitud pública generada durante la sesión obtiene folio consecutivo (la primera será **SOL-2026-0002**, tal como pide el brief).
- Consulta pública de estatus de referencia: folio `SOL-2026-0001` + correo `solicitante@intercon.com.mx`.

Todos los cambios que realices (nuevas solicitudes, decisiones, actividades, comentarios, evidencias, usuarios) se persisten en `localStorage` bajo la clave `gestion-ic:db:v1`, por lo que sobreviven a recargas de página. Puedes limpiar el estado demo borrando esa clave (o los datos de sitio) desde las herramientas de desarrollo del navegador.

## Arquitectura

```
src/
  types/            Modelos de dominio (reflejan las 9 tablas de Airtable)
  lib/
    permissions.ts  Autorización centralizada: can(rol, accion)
    format.ts       Formateo de fechas, moneda y enmascarado de correo/teléfono
  data/seed.ts       Datos semilla del modo demo
  services/
    config.ts        Resuelve modo demo vs. modo API (VITE_API_BASE_URL)
    http.ts           Cliente HTTP + catálogo de endpoints esperados (modo API)
    demo/             Implementación demo de cada servicio (localStorage)
    api/              Implementación API de cada servicio (fetch a n8n)
    authService.ts, otpService.ts, solicitudesService.ts,
    proyectosService.ts, actividadesService.ts, evidenciasService.ts,
    comentariosService.ts, usuariosService.ts, dashboardService.ts,
    bitacoraService.ts, configuracionService.ts
                       Fachada pública: cada una expone la misma interfaz
                       sin importar el modo activo
  context/
    AuthContext.tsx    Sesión activa + "vista simulada" de rol (solo admin)
    ToastContext.tsx   Notificaciones discretas
  routes/guards.tsx     RequireAuth y RequirePermission (guards por ruta)
  components/
    layout/            Header público, footer, shell interno con sidebar
    ui/                 Primitivos reutilizables (Button, Card, Modal, etc.)
    otp/OtpModal.tsx     Modal de verificación OTP reutilizado en 3 flujos
    gantt/GanttChart.tsx Implementación propia de carta Gantt (sin librerías externas)
    charts/              Wrappers de Recharts para el dashboard ejecutivo
  pages/
    public/             Landing, solicitar proyecto, consultar estatus, login
    app/                Dashboard, solicitudes, proyectos, actividades,
                         mis actividades, usuarios, bitácora, configuración
```

### Autorización

Todos los permisos se resuelven en un único lugar: `src/lib/permissions.ts`, mediante la función `can(rol, accion)`. La interfaz **no** oculta botones como único mecanismo de seguridad: las rutas están protegidas con guards (`RequirePermission`) y, de forma más importante, **cada método de la capa de servicios demo vuelve a validar el permiso antes de mutar datos** (ver por ejemplo `solicitudesService.decidir` o `actividadesService.actualizar`), tal como ocurriría contra un backend real.

### Cálculo de avance de proyecto

El avance de un proyecto es siempre derivado, nunca editable directamente: se calcula como la suma ponderada de `peso × avance` de sus actividades no canceladas. La capa de servicios impide que la suma de pesos de las actividades de un proyecto supere 100%, tanto al crear como al editar una actividad.

## Modo demo vs. modo API

- **Modo demo** (por defecto): cada servicio (`src/services/demo/*.ts`) opera sobre un repositorio en memoria respaldado por `localStorage`. Simula latencia de red, valida permisos y mantiene una bitácora de acciones críticas.
- **Modo API**: al definir `VITE_API_BASE_URL`, los mismos servicios (`src/services/api/*.ts`) llaman a los endpoints documentados en `src/services/http.ts` (`ENDPOINTS`), todos bajo el prefijo configurado. Ningún componente de UI necesita cambiar: solo importan `xService` desde `src/services/xService.ts`, que resuelve automáticamente qué implementación usar.

Endpoints previstos para el backend de n8n (aún no asumidos como existentes):

```
POST /auth/login
POST /auth/request-otp
POST /auth/verify-otp
POST /public/requests/start
POST /public/requests/confirm
POST /public/status/request-otp
POST /public/status/verify
GET  /requests
GET  /requests/:id
POST /requests/:id/decision
GET  /projects
GET  /projects/:id
POST /projects
PATCH /projects/:id
GET  /projects/:id/tasks
POST /projects/:id/tasks
PATCH /tasks/:id
POST /tasks/:id/comments
POST /tasks/:id/evidence
GET  /dashboard
GET  /users
POST /users
PATCH /users/:id
```

## Seguridad

- Sin tokens de Airtable ni secretos embebidos en el frontend.
- El correo y el teléfono se enmascaran al confirmar un código OTP (`maskEmail` / `maskPhone`).
- Las contraseñas nunca se imprimen en consola.
- Guards de ruta por permiso (`RequirePermission`) + validación redundante en la capa de servicios.
- Acciones críticas (decisión sobre una solicitud, activar/desactivar usuario, validar una actividad) requieren confirmación explícita.
- Bitácora demo de acciones críticas, consultable por el rol Administrador.
- Distintivo visible de "Ambiente demo" en el sidebar interno y en el footer público.

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Verificación de tipos (`tsc -b`) + build de producción con Vite. |
| `npm run preview` | Sirve el build de `/dist` localmente. |
| `npm run lint` | Linter (oxlint). |
