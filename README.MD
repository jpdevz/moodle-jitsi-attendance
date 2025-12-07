# Sistema de Asistencia para Talleres en Moodle usando Jitsi & Google Apps Script

Este proyecto es un MVP funcional para registrar asistencia a talleres en línea
sin depender de Zoom, usando:

- Moodle (recurso *Página* con JavaScript embebido)
- Jitsi (meet.jit.si)
- Google Apps Script (WebApp)
- Google Sheets (como base de datos)
- Looker Studio (para dashboards de asistencia)

## Características principales

- Detección automática de usuario (id, nombre, email, rol)
- Normalización de salas por taller (cohortes)
- Registro de sesiones por usuario (joined_at, left_at, duración)
- Heartbeats periódicos para saber quién está activo
- Panel de datos listo para conectarse a Looker Studio

## Arquitectura

Ver [`docs/architecture.md`](docs/architecture.md)

## Cómo usar este repo

1. Configura las hojas de Google según [`templates/sheets-structure.md`](templates/sheets-structure.md)
2. Crea el WebApp de Apps Script y pega el contenido de [`apps-script/backend.gs`](apps-script/backend.gs)
3. Inserta el script de [`moodle-embed/page-script.js`](moodle-embed/page-script.js)
   en un recurso *Página* en Moodle.
4. (Opcional) Conecta Google Sheets a Looker Studio siguiendo [`docs/looker-studio.md`](docs/looker-studio.md).

