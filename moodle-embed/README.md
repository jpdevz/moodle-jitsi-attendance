# Script de integración con Moodle

Este script está pensado para ser insertado en un recurso *Página* dentro de Moodle.

- Usa placeholders como `{firstname}`, `{username}`, `{email}`
- Lee `M.cfg` cuando está disponible
- Construye el identificador de sala (room_name) a partir del título del recurso
- Envía datos al backend mediante `token`, `heartbeat` y `leave`

## Uso básico

1. Crear un recurso *Página* en el curso/taller.
2. En el contenido HTML, incluir:
   - El HTML visible (mensaje de bienvenida, por ejemplo).
   - El `<script>` con el contenido de `page-script.js`.
3. Reemplazar `WEBAPP_URL` por la URL de la WebApp de Apps Script.
