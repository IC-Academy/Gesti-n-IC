# Gestión IC Mantenimiento — Demo de autorización fase 1

## Incluye

- Enfoque exclusivo en inmuebles e instalaciones.
- Solicitudes con inmueble, ubicación exacta, tipo de mantenimiento, especialidad e impacto operativo.
- Cuadrillas de mantenimiento general, climatización, obra civil y administración de inmuebles.
- Jira queda fuera de alcance y documentado para fase 2.

- Acceso por perfiles demo: Usuario, Líder y Administrador (8 personas de ejemplo).
- Portal del solicitante nuevo (público/semipúblico): registrar solicitud (>30 días),
  confirmación con folio, consulta de estatus por folio + correo.
- Catálogo centralizado de 13 estados con historial de cambios.
- Portafolio de proyectos por rol (mis proyectos / equipo / todos), detalle con
  seguimiento, carga de evidencias, comentarios e historial completo.
- Líder: solicitudes del área, dictamen (aprobar/rechazar/ajustes), asignación de
  responsables, carga de trabajo, validación de evidencias, alertas.
- Administrador: usuarios, roles y permisos, áreas y líderes, catálogos, auditoría.
- Se conservan intactos los contratos PBI-01 a PBI-07 (n8n/Airtable): bandeja del
  líder BI, registrar/consultar solicitud, evaluación y centro de autorizaciones.
- Identidad visual Gestión IC, responsiva, en español.

## Qué es real y qué es demostración

Ver la sección "Qué es real y qué es demostración" en `README.md`. En resumen: el
flujo `/#/bi/...` (PBI-01 a PBI-07) es real; el módulo de Gestión de Proyectos
(`/#/proyectos`, `/#/solicitudes`, `/#/admin/...`) opera en modo demostración sobre
`localStorage`, con una capa de servicio ya preparada para conectarse a n8n.

## Seguridad de la demo

- No contiene API keys reales ni correos reales (dominio `@iccorp-demo.mx`).
- No contiene URLs reales de webhooks; `.env.example` solo conserva nombres de variables.
- No inyecta API keys `VITE_*` durante GitHub Actions porque quedarían visibles en el navegador.
- Distingue guardado local, sincronización pendiente, exitosa y fallida.
- `SEND_REAL_EMAILS` debe permanecer en `false` en n8n (sin cambios).
- Conserva los folios `SOL-`/`PRY-` del flujo PBI y usa `GIC-SOL-`/`GIC-PRY-` para el
  módulo nuevo, para no confundir ambos sistemas.
- La autenticación por perfiles es simulada; Entra ID (o equivalente) queda pendiente
  para producción, igual que la validación de rol del lado del servidor.

## Compilación

1. Copiar `.env.example` como `.env`.
2. Ejecutar `npm ci`.
3. Ejecutar `npm run build` (corre `tsc -b` y `vite build`; falla si hay errores de
   TypeScript o de build).

El workflow existente de GitHub Pages (`.github/workflows/deploy.yml`) realiza la
misma compilación automáticamente al hacer `push` a `main`.
