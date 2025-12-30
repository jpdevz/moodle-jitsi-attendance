# Arquitectura — Moodle + Jitsi Attendance

## Visión general
Arquitectura serverless y gratuita para registrar asistencia y puntualidad
en talleres online integrados en Moodle y ejecutados en Jitsi.

## Componentes
- **Moodle**: LMS y punto de entrada del usuario
- **JS Embed**: script en recurso “Página” que captura contexto y redirige
- **Google Apps Script**: WebApp (API liviana)
- **Google Sheets**: almacenamiento + vistas calculadas
- **Looker Studio**: visualización

## Flujo de eventos
1. Usuario abre recurso “Página” en Moodle
2. JS obtiene:
   - username / email / nombre
   - nombre del taller (room)
3. JS envía evento `token` a Apps Script
4. Apps Script:
   - registra usuario/sala si no existen
   - registra sesión (class_date, joined_at, role)
5. Google Sheets consolida en `class_summary`
6. Looker Studio consume `class_summary`

## Eventos soportados
- `token`: inicio de sesión
- `heartbeat`: (opcional) señal de presencia
- `leave`: salida (opcional)

## Decisiones de diseño
- **Room determinística**: mismo taller → misma sala Jitsi
- **Sesiones repetibles**: misma sala puede usarse semanalmente
- **Atraso docente**: métrica principal
- **Backend gratuito**: Apps Script + Sheets

## Escalabilidad futura
- Migración a Supabase / PostgreSQL
- API REST
- Multi-campus
