# Moodle Embed — Jitsi Attendance

Este script se inserta en un **recurso tipo Página** en Moodle.

## Qué hace
- Detecta usuario logueado en Moodle
- Obtiene nombre del taller
- Llama al backend (Apps Script)
- Redirige a la sala Jitsi correspondiente

## Uso
1. Crear recurso **Página** en Moodle
2. Pegar el script desde `page-script.js`
3. Ajustar variables:
   - `WEBAPP_URL`
   - (opcional) normalización del nombre de sala

## Requisitos
- Moodle con usuarios autenticados
- Apps Script desplegado como WebApp
- Google Sheet configurado

## Notas
- No requiere plugins Moodle
- No almacena contraseñas
- Compatible con uso semanal de salas
