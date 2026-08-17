# Gestión IC — Primera demo

## Incluye

- Acceso por perfiles: Usuario, Líder y Administrador.
- Solicitudes de proyectos mayores a 30 días.
- Consulta de solicitudes y contratos existentes PBI-01 a PBI-07.
- Bandeja del líder, evaluación y centro de autorizaciones.
- Portafolio, avance, Gantt y evidencias.
- Gestión de equipo, carga, usuarios, roles y áreas.
- Identidad visual Gestión IC.

## Seguridad de la demo

- No contiene API keys.
- SEND_REAL_EMAILS debe permanecer en false en n8n.
- Conserva los folios SOL- y PRY-.
- La autenticación por perfiles es simulada; Entra ID queda para producción.

## Compilación

1. Copiar .env.example como .env.
2. Ejecutar npm ci.
3. Ejecutar npm run build.

El workflow existente de GitHub Pages también realiza la compilación al publicar.
