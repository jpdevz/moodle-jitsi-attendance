# Backend (Google Apps Script)

Este directorio contiene el código del backend que se despliega como WebApp
en Google Apps Script. Se encarga de:

- Recibir los eventos `token`, `heartbeat`, `leave`
- Escribir datos en Google Sheets (`users`, `rooms`, `sessions`, `heartbeats`)

## Configuración

1. Crea un nuevo proyecto en Google Apps Script.
2. Crea una hoja de cálculo con las pestañas:
   - `users`
   - `rooms`
   - `sessions`
   - `heartbeats`
3. Configura la zona horaria de la hoja a `Santiago (GMT-3)`.
4. Copia el contenido de `backend.gs` en el editor de Apps Script.
5. Reemplaza `YOUR_SPREADSHEET_ID_HERE` por el ID de tu hoja de cálculo.
6. Publica el WebApp (`Implementar → Implementar como aplicación web`).
