# Gestión IC — Portal Corporativo de Proyectos

Primera versión funcional del portal para administrar proyectos con duración mayor a
30 días entre distintas áreas de la organización: solicitud, dictamen, asignación,
seguimiento con evidencias y administración por roles (Usuario, Líder, Administrador).

Conserva intactos los contratos reales **PBI-01 a PBI-07** con n8n/Airtable (registro y
consulta de solicitudes BI, bandeja, evaluación y autorizaciones) e incorpora, como
módulo nuevo, la gestión de proyectos con modelo de datos completo, catálogo de
estados centralizado, permisos por rol y datos de demostración.

**Repositorio:** https://github.com/IC-Academy/Gesti-n-IC
**URL pública (GitHub Pages):** https://ic-academy.github.io/Gesti-n-IC/

Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router (`HashRouter`) +
React Hook Form + Zod + Recharts + lucide-react. Sin backend propio.

## Qué es real y qué es demostración

| Área | Estado | Detalle |
|---|---|---|
| Solicitudes BI (`/#/bi/...`) | **Real** | Habla directo con los 7 webhooks de n8n/Airtable (PBI-01 a PBI-07). Contratos sin cambios. |
| Gestión de Proyectos (`/#/proyectos`, `/#/solicitudes`, `/#/admin/...`, `/#/portal/...`) | **Demostración** | No existe todavía un backend para este módulo. Los datos viven en `localStorage` (`src/lib/demoStore.ts`), sembrados con información de ejemplo realista. La capa de servicio (`src/lib/projectsApi.ts`) ya está tipada y preparada para conectarse a n8n vía `VITE_PROJECTS_REQUEST_URL` cuando ese webhook exista. |
| Autenticación / selección de perfil | **Simulada** | No hay login real: se elige una persona de ejemplo (ver `src/lib/session.tsx`). La versión productiva debe sustituir esto por el proveedor de identidad corporativo (p. ej. Microsoft Entra ID). |

En ambos casos, si falta configuración (una URL `VITE_PBI0X_URL`, o el nuevo
`VITE_PROJECTS_REQUEST_URL`), la aplicación **nunca se queda en blanco**: cae a un modo
demostración local claramente marcado en la interfaz (etiqueta "● Datos de
demostración" / "● Integración real · n8n").

## Cómo probar cada rol

1. `npm install && npm run dev` y abre `http://localhost:5173/Gesti-n-IC/`.
2. En la pantalla de bienvenida, elige una de las 8 personas de ejemplo (1
   administrador, 2 líderes, 5 usuarios, repartidos en 4 áreas). El rol y el área se
   muestran en el encabezado y determinan qué ves.

| Persona | Rol | Área | Qué puedes probar |
|---|---|---|---|
| Andrea Bautista | Administrador | Dirección de Tecnología | Todo: usuarios, roles, áreas, catálogos, auditoría, y todas las funciones de líder/usuario. |
| Jorge Mejía | Líder | Inteligencia de Negocios | Solicitudes del área, asignación, carga de trabajo, validación de evidencias, alertas. |
| Patricia Solís | Líder | Operaciones | Igual que Jorge, con el portafolio de Operaciones (incluye un proyecto bloqueado y uno próximo a vencer). |
| Daniela Juárez / Ricardo Nava | Usuario | Inteligencia de Negocios | Mis proyectos, registrar avance, cargar evidencias, historial. |
| Manuel Ortega / Sofía Camacho | Usuario | Operaciones | Igual, con un proyecto recién asignado (sin actualización todavía). |
| Frances Aviña | Usuario | Nóminas | Un proyecto atrasado y uno cancelado, para ver esos estados. |

Flujo sugerido para probar el ciclo completo:

1. Sin iniciar sesión, ve a **"Registrar una solicitud sin iniciar sesión"** en la
   pantalla de acceso (`/#/publico/nueva-solicitud`) y registra una solicitud nueva
   (duración > 30 días). Copia el folio.
2. En **"Consultar estatus"** (`/#/publico/consultar`), consúltala con el folio y el
   correo — verás el historial de estados.
3. Entra como **Andrea Bautista** (o el líder del área que sugeriste) → **Solicitudes
   del área** → abre la solicitud → **Iniciar revisión → Aprobar → Enviar a
   asignación** → asigna responsable, equipo, fechas y prioridad → se crea el proyecto.
4. Entra como el **usuario responsable** asignado → **Mis proyectos** → abre el
   proyecto → pestaña **Seguimiento**: registra avance, marca un bloqueo si quieres, y
   adjunta una evidencia.
5. Entra de nuevo como **líder/administrador** → **Validación de evidencias**: valida o
   rechaza la evidencia cargada → **Alertas**: revisa atrasados/bloqueados/sin
   actualización.

Los cambios se guardan en el `localStorage` del navegador; puedes restablecer todo a
los datos originales desde **Administración → Catálogos → Restablecer datos de
demostración**.

## Roles y permisos (resumen)

La matriz completa vive en `src/lib/permissions.ts` y se visualiza en
**Administración → Roles y permisos**. Resumen:

- **Usuario:** ve solo sus proyectos asignados, registra avance/comentarios/evidencias,
  consulta historial. No asigna integrantes, no aprueba solicitudes, no cambia roles ni
  elimina proyectos.
- **Líder:** ve y dictamina solicitudes de su área, asigna/reasigna responsables,
  define fechas y prioridad, valida evidencias, cambia el estado operativo, consulta
  carga de trabajo y alertas de su área. No administra áreas ajenas ni cambia roles
  globales.
- **Administrador:** todo lo anterior sobre cualquier área, más gestión de usuarios,
  roles, áreas, líderes, catálogos y auditoría global.

**Importante — esto es solo UX.** Los *guards* de ruta (`src/components/gestion/RouteGuard.tsx`)
y los `if` de permisos solo ocultan/redirigen en el navegador. Cuando este módulo se
conecte a un backend real (n8n u otro), cada operación de escritura debe volver a
validar el rol del lado del servidor — nunca confiar solo en lo que oculta el frontend.

## Catálogo de estados (13 estados, centralizado)

Definido una sola vez en `src/lib/catalog.ts` (colores, orden, agrupación y
transiciones permitidas) y usado por todas las pantallas:

`Solicitud recibida → En revisión → Requiere ajustes | Aprobada → Pendiente de
asignación → Asignada → En planeación → En ejecución → Bloqueada | En validación →
Finalizada`, con `Rechazada` y `Cancelada` como estados de cierre alternos.

Cada cambio de estado (de una solicitud o de un proyecto) queda registrado en
`StatusHistory` con fecha, usuario, estado anterior, estado nuevo y comentario —
visible en la pestaña **Historial** de cada proyecto y en la consulta pública de
estatus.

## Modelo de datos (frontend)

`src/lib/types.ts` centraliza las interfaces (sin `any`): `User`, `Role`, `Area`,
`Project`, `ProjectRequest`, `ProjectAssignment`, `ProgressUpdate`, `Evidence`,
`Comment`, `StatusHistory`, `Notification`, `AuditEntry` (además de los tipos ya
existentes de los contratos PBI-01 a PBI-07). `src/lib/demoStore.ts` es la única fuente
de verdad de estos datos en esta versión (persistida en `localStorage`); las pantallas
nunca mutan datos directamente, solo llaman a las funciones exportadas de ese archivo.

## Datos de demostración incluidos

- **4 áreas**: Inteligencia de Negocios, Operaciones, Nóminas (sin líder asignado a
  propósito, para poder probar "Asignar líder" como administrador) y Dirección de
  Tecnología.
- **8 personas**: 1 administrador, 2 líderes, 5 usuarios (ver tabla arriba). Ningún
  correo es real; todos usan el dominio `@iccorp-demo.mx`.
- **10 proyectos** con estados variados: atrasado, bloqueado, próximo a vencer, sin
  actualización reciente, en validación, finalizado y cancelado.
- **15 solicitudes** en distintos estados del catálogo (recibida, en revisión, requiere
  ajustes, aprobada, rechazada, pendiente de asignación, asignada).
- Evidencias, comentarios, historial de estados, notificaciones y bitácora de
  auditoría de ejemplo.

## Requisitos

- Node.js 20+ y npm 10+.

## Instalar dependencias

```bash
npm install
```

## Configurar variables de entorno

```bash
cp .env.example .env
```

`.env` **nunca** se sube al repositorio (está en `.gitignore`). Las URLs de
`.env.example` para PBI-01 a PBI-07 son las de producción real de n8n
(`jmejiaromero.app.n8n.cloud`); normalmente no hace falta cambiarlas. Si falta alguna,
esa pantalla específica cae a modo demostración local (ver
`src/lib/pbiDemoFallback.ts`) en vez de fallar o quedar en blanco.

`VITE_PROJECTS_REQUEST_URL` es nueva y opcional (ver sección de arriba): déjala vacía
mientras el módulo de proyectos siga en modo demo.

## Ejecutar en desarrollo

```bash
npm run dev
```

## Compilar (build de producción)

```bash
npm run build
```

Ejecuta `tsc -b` (sin errores de TypeScript permitidos) y luego `vite build`, generando
`dist/` lista para publicarse en cualquier hosting estático.

## Previsualizar el build

```bash
npm run preview
```

## Publicar en GitHub Pages (repositorio IC-Academy/Gesti-n-IC)

`vite.config.ts` trae `base: "/Gesti-n-IC/"` como valor por defecto (respetando
mayúsculas/minúsculas exactas). El workflow `.github/workflows/deploy.yml`:

1. Se dispara en cada `push` a `main` (o manualmente desde **Actions**).
2. `npm ci` → `npm run build` (si el build falla, no se publica nada).
3. Sube `dist/` como artefacto de Pages y lo despliega con `actions/deploy-pages`.

Antes del primer despliegue, configurar en el repositorio:

- **Settings → Pages → Source = "GitHub Actions"** (no "Deploy from a branch").
- **Settings → Secrets and variables → Actions → Variables**: las 7 variables
  `VITE_PBI0X_URL` (ver tabla más abajo). `VITE_PROJECTS_REQUEST_URL` es opcional.
- Si se usa `VITE_DEFAULT_API_KEY`, agregarla como **Secret** (no como Variable).

### HashRouter — por qué no hay pantalla en blanco al refrescar

La app usa `HashRouter` (rutas con `#`, p. ej. `.../#/proyectos`). GitHub Pages sirve
siempre el mismo `index.html`; como la ruta "real" para el servidor nunca cambia (todo
lo que va después de `#` lo interpreta React Router ya dentro del navegador), **no
hace falta el truco del `404.html`** ni configuración de reescritura de rutas.
Refrescar cualquier pantalla profunda (por ejemplo
`.../#/proyectos/proj-0005?tab=historial`) siempre carga la aplicación completa. Una
ruta que no existe cae en una pantalla 404 propia (`src/routes/general/NotFound.tsx`),
nunca en blanco.

## Variables de entorno requeridas para el build de CI

| Variable | Uso |
|---|---|
| `VITE_PBI01_URL` … `VITE_PBI07_URL` | Webhooks reales de n8n (solicitudes BI). Si faltan, esas pantallas caen a modo demo local (no bloquean el build ni la app). |
| `VITE_DEFAULT_API_KEY` | Opcional; `x-api-key` por defecto para los endpoints privados PBI-01/03/04/05. Configurar como **Secret**, no como Variable. |
| `VITE_PROJECTS_REQUEST_URL` | Opcional; webhook futuro para el Portal del Solicitante nuevo (módulo de Proyectos). Vacío = modo demo. |
| `VITE_BASE_PATH` | Opcional; ya tiene `"/Gesti-n-IC/"` por defecto en `vite.config.ts`. |

## Payloads documentados

### Módulo nuevo — Nueva solicitud de proyecto (`VITE_PROJECTS_REQUEST_URL`)

Ver el bloque de comentarios en `src/lib/projectsApi.ts`. Resumen del `POST` (JSON):

```jsonc
{
  "folio": "GIC-SOL-2026-1001",
  "nombreSolicitante": "string",
  "correoSolicitante": "string",
  "areaSolicitante": "string",
  "nombreProyecto": "string",
  "descripcion": "string",
  "problemaONecesidad": "string",
  "objetivo": "string",
  "beneficioEsperado": "string",
  "fechaInicioDeseada": "2026-09-01T00:00:00.000Z",
  "fechaTerminoEstimada": "2026-12-15T00:00:00.000Z",
  "prioridad": "Baja | Media | Alta | Crítica",
  "areaResponsableSugerida": "string",
  "comentariosAdicionales": "string opcional",
  "archivosIniciales": [{ "nombreArchivo": "string", "tipo": "mime/type", "tamanoBytes": 0 }],
  "creadoEn": "2026-08-17T00:00:00.000Z"
}
```

Respuesta esperada: `{ "ok": boolean, "error"?: string }`. Es una llamada "best
effort": si falla o el webhook no existe, la solicitud igual queda registrada en el
demo store local y la persona que la registró no ve ningún error.

### PBI-01 a PBI-07 (real, sin cambios)

Los contratos completos (payload y respuesta exactos) están en `src/lib/types.ts`
(interfaces `RegistrarSolicitudPayload/Response`, `ConsultarSolicitudPayload/Response`,
etc.) y se implementan en `src/lib/api.ts`. No se modificaron en esta ronda de
cambios; ver la sección "Anexo: integración PBI-01..07" más abajo para el historial
completo de verificación contra el backend real.

## Estructura del proyecto

```
src/
  lib/
    types.ts            Tipos de PBI-01..07 (sin cambios) + modelo nuevo (User, Project, ...)
    catalog.ts           Catálogo centralizado de 13 estados, prioridades, transiciones
    permissions.ts        Matriz de permisos por rol (Usuario/Líder/Administrador)
    demoStore.ts          "Base de datos" demo (localStorage) + mutaciones tipadas
    demoSelectors.ts       Consultas derivadas (KPIs, atrasados, carga de trabajo, ...)
    session.tsx            Sesión demo (selección de persona) — sustituir por auth real
    projectsApi.ts          Notificación best-effort a n8n para el módulo nuevo (opcional)
    pbiDemoFallback.ts       Modo demo local para PBI-01..07 si falta la URL real
    config.ts / api.ts        Config y cliente fetch de los webhooks reales (sin cambios de contrato)
  components/
    Layout.tsx            Sidebar + header con navegación por rol y notificaciones
    PortalShell.tsx         Encabezado del portal público (sin sesión)
    gestion/                Componentes del módulo nuevo (StatusBadge, KpiRow, EvidenceUploader,
                             RouteGuard, NotificationBell, ProgressBar, Alert, ModeTag)
    Badge/Button/Card/Field/States/ConfigError   Componentes genéricos ya existentes
  routes/
    Acceso.tsx             Login demo (selección de persona)
    Dashboard.tsx            Dashboard único, adapta KPIs/paneles según el rol
    general/                 Perfil, RecuperarAcceso (simulada), NotFound (404)
    portal/                  Nueva solicitud + Consultar estatus (portal del solicitante nuevo)
    proyecto/                Lista de proyectos por alcance + Detalle (tabs: Resumen/
                              Seguimiento/Evidencias/Historial)
    solicitud/                Lista de solicitudes por alcance + Detalle con dictamen/asignación
    lider/                    Asignación, Carga de trabajo, Validación de evidencias, Alertas
    admin/                    Usuarios, Roles y permisos, Áreas y líderes, Catálogos, Auditoría
    BandejaBI.tsx / RegistrarSolicitud.tsx / ConsultarSolicitud.tsx / EvaluacionBI.tsx /
      CentroAutorizaciones.tsx     Flujo real PBI-01..07, sin cambios de lógica (solo de ruta)
  App.tsx                 Rutas (HashRouter): público, autenticado y guards por rol
```

## Resumen de archivos creados y modificados en esta ronda

**Nuevos (módulo de Gestión de Proyectos):** `src/lib/catalog.ts`, `permissions.ts`,
`demoStore.ts`, `demoSelectors.ts`, `session.tsx`, `projectsApi.ts`,
`pbiDemoFallback.ts`; `src/components/PortalShell.tsx` y todo `src/components/gestion/*`;
`src/routes/Acceso.tsx`, `Dashboard.tsx`, `general/*`, `portal/*`, `proyecto/*`,
`solicitud/*`, `lider/*`, `admin/*`.

**Modificados:** `src/App.tsx` (árbol de rutas completo con guards), `src/components/Layout.tsx`
(navegación por rol, notificaciones, perfil), `src/lib/types.ts` (se agregó el modelo
nuevo al final, sin tocar los tipos PBI existentes), `src/lib/api.ts` (fallback a modo
demo cuando falta una URL `VITE_PBI0X_URL`, aditivo — el comportamiento con URL
configurada no cambió), `.env.example` y este `README.md`.

**Sin cambios de lógica/contrato:** `src/lib/config.ts`, `src/routes/BandejaBI.tsx`,
`RegistrarSolicitud.tsx`, `ConsultarSolicitud.tsx`, `EvaluacionBI.tsx`,
`CentroAutorizaciones.tsx` (solo se movieron de ruta, de `/registrar` etc. a
`/bi/registrar` etc., para agrupar visualmente la integración real con n8n aparte del
módulo nuevo — no afecta a n8n ya que las rutas del frontend no forman parte de
ningún contrato con el backend).

**Eliminado:** `src/routes/GestionDemo.tsx` — era una maqueta estática (datos
hardcodeados, sin modelo de datos ni permisos reales) que representaba las mismas
pantallas (Resumen, Proyectos, Equipo, Administración) ahora implementadas de verdad en
`Dashboard.tsx`, `proyecto/*`, `lider/CargaTrabajo.tsx` y `admin/*`.

## ⚠️ Seguridad — advertencia técnica importante

Este frontend es un sitio **estático** (HTML/JS/CSS servido desde GitHub Pages, sin
servidor propio). Dos capas de seguridad a tener en cuenta:

**1) `x-api-key` de PBI-01/03/04/05** (sin cambios respecto a la versión anterior): se
guarda en `localStorage` y viaja en cada `fetch()`. No constituye autenticación real
por persona — ver detalle histórico más abajo. Aceptable para piloto interno, no para
producción con más usuarios.

**2) Guards de rol del módulo de Gestión de Proyectos:** ocultan/deshabilitan acciones
en el navegador (ver `src/lib/permissions.ts`), pero no hay backend que las repita. Con
las herramientas de desarrollador, cualquier persona podría alterar el estado del
navegador. Antes de producción, cualquier backend real que reciba estas acciones
(aprobar, asignar, cambiar rol, eliminar) **debe volver a validar el rol del lado del
servidor**.

Antes de considerar este portal "productivo" en cualquiera de los dos módulos, se debe
reemplazar la autenticación simulada por identidad real (Microsoft Entra ID u
equivalente) con un backend que valide cada operación.

## No mocks como fuente de verdad silenciosa, no Airtable directo

- El flujo PBI-01..07 nunca usa datos de ejemplo como fuente principal: todo viene de
  la respuesta real de los webhooks (con un fallback demo explícito y visible solo si
  falta configuración).
- El módulo de Gestión de Proyectos usa `localStorage` como fuente de verdad en esta
  primera versión, siempre marcado como "Datos de demostración" en la interfaz.
- El frontend nunca llama a la API de Airtable directamente ni contiene su token; todo
  pasa (o pasaría) por webhooks de n8n.

---

## Anexo: integración real PBI-01 a PBI-07 (histórico, sin cambios)

Las siguientes secciones documentan el trabajo de verificación realizado
originalmente contra el backend real de n8n/Airtable. Se conservan tal cual porque
siguen siendo válidas: no se tocó ningún contrato, payload, tipo ni lógica de estas
pantallas en esta ronda (solo se reorganizaron sus rutas bajo `/bi/...` y se les agregó
un fallback de modo demo cuando falta la URL, ver `src/lib/pbiDemoFallback.ts`).

### Pantallas

| Ruta actual | Pantalla | Webhook(s) que usa |
|---|---|---|
| `/bi/bandeja` | Bandeja BI | PBI-03 `pbi/solicitudes/listar` |
| `/bi/registrar` | Registrar solicitud | PBI-01 `pbi/solicitudes` |
| `/bi/consultar` | Consultar solicitud | PBI-02 `pbi/solicitudes/consultar` |
| `/bi/evaluacion/:folio` | Evaluación BI + envío a autorización (microinforme) | PBI-04, PBI-05 |
| `/bi/autorizaciones` | Centro de autorizaciones | PBI-06, PBI-07 |

### CORS

Los 7 webhooks de n8n están configurados con `Allowed Origins =
https://ic-academy.github.io` (origen exacto; CORS no compara la ruta, solo
esquema+host+puerto). Para pruebas locales agregar también `http://localhost:5173`
separado por coma en el nodo Webhook de cada workflow.

### Enlace de aprobación por correo (token en la URL)

`/#/bi/autorizaciones?token=TOKEN` autocompleta el token desde el correo generado por
PBI-05 (`PORTAL_BASE_URL = 'https://ic-academy.github.io/Gesti-n-IC'`).

### Bloqueo de tokens ya utilizados

El Centro de Autorizaciones distingue: token pendiente (formulario normal), token ya
respondido (formulario oculto, se muestra la decisión registrada) y token
inválido/usado/expirado (rechazado por PBI-07 del lado del servidor como última línea
de defensa).

### Modo seguro de correos (SEND_REAL_EMAILS)

Todos los workflows relevantes (PBI-01, PBI-05, PBI-07) mantienen
`SEND_REAL_EMAILS = false`: las notificaciones se redirigen a un buzón interno de
validación con aviso `[PRUEBA]`. No requiere cambios en el frontend.

### Evidencia de prueba real contra n8n (verificación previa)

- **PBI-02** (ejecución `2382`): payload con folio piloto real → respuesta 200 con los
  campos exactos que espera `ConsultarSolicitudResponse`.
- **PBI-03** (ejecución `2383`): payload `{ estados: [], area: "" }` → `solicitudes[]`
  con exactamente los campos de `SolicitudBandeja`.
- **PBI-05 → PBI-06** (ejecuciones `2384`/`2385`): se generó un token real de un solo
  uso y se confirmó que `ConsultarAprobacionResponse` trae el microinforme correcto.

Esto confirma que los tipos y el parseo del frontend son correctos contra las
respuestas reales del backend ya publicado.
