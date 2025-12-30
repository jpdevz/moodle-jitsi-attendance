# Moodle + Jitsi Attendance (Apps Script + Sheets + Looker)

Sistema gratuito para **registrar asistencia y medir atrasos** en talleres online usando **Moodle + Jitsi**, con backend liviano en **Google Apps Script** y almacenamiento en **Google Sheets**, listo para visualizar en **Looker Studio**.

> Objetivo principal: **medir atrasos del profesor**, ya que los alumnos esperan hasta que el docente inicie la sesión.

---

## ✅ Features

- Captura de usuario desde Moodle (username / email / nombre)
- Redirección a sala de **Jitsi** (room determinística por taller)
- Registro de eventos en Google Sheets vía Apps Script (WebApp)
- Cálculo de **teacher_delay_min** (minutos de atraso del profesor) por clase
- Datos consolidados para dashboards en Looker Studio

---

## 🧱 Arquitectura (alto nivel)

1. Usuario abre un recurso “Página” en Moodle  
2. JS obtiene datos del usuario + nombre del taller  
3. JS llama a Apps Script (token/heartbeat/leave)  
4. Apps Script escribe en Google Sheets  
5. Google Sheets genera vistas calculadas (p. ej. `class_summary`)  
6. Looker Studio consume `class_summary`

Documentación técnica: ver [`architecture.md`](./architecture.md)

---

## 📦 Estructura del repositorio

```text
.
├─ apps-script/
│  └─ backend.gs               # WebApp: token/heartbeat/leave -> Sheets
├─ moodle-embed/
│  └─ page-script.js           # Script para recurso “Página” en Moodle
├─ architecture.md             # Arquitectura y flujo
└─ README.md



#################################


🗃️ Modelo de datos (Sheets)

Hojas principales:

users: usuarios detectados (first_seen / last_seen / visits)

rooms: salas/talleres (cohort_id, last_used_at, etc.)

sessions: registro por ingreso (class_date, joined_at, role)

class_summary: consolidado por clase (hora oficial vs ingreso profe)

class_summary es la fuente recomendada para Looker Studio.

📐 Reglas de negocio

Atraso profesor = teacher_joined_at - start_time (en minutos)

Si el profesor entra antes o a la hora: atraso = 0

Los alumnos no se penalizan (su puntualidad inicia desde la conexión del profesor)

🚀 Setup rápido (MVP)
1) Apps Script (WebApp)

Crea un proyecto Apps Script

Pega el contenido de apps-script/backend.gs

Configura SPREADSHEET_ID

Deploy → “Web app”

Execute as: Me

Who has access: Anyone (o “Anyone with the link”)

2) Moodle (recurso Página)

Crea/edita un recurso tipo “Página”

Inserta el script basado en moodle-embed/page-script.js

Reemplaza WEBAPP_URL por la URL del WebApp (Apps Script)

📊 Dashboard (Looker Studio)

Campos recomendados desde class_summary:

class_date

room_name

cohort_id

start_time

teacher_joined_at

teacher_delay_min

status

KPIs típicos:

Promedio de atraso por profesor

% clases a tiempo

Ranking de puntualidad docentes

Atrasos por sala/cohorte y por semana

🔒 Seguridad / buenas prácticas

No subir tokens, IDs privados, ni URLs sensibles al repo.

Usar .gitignore para archivos del sistema (ej: .DS_Store).

Si este repo se hace público, reemplazar IDs por placeholders.



📄 Licencia

MIT (o la que definas).