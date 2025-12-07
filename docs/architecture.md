# Arquitectura del Sistema

```mermaid
flowchart LR
    A[Usuario en Moodle] --> B[Recurso Página con JS]
    B --> C[WebApp Google Apps Script]
    C --> D[(Google Sheets)]
    B --> E[Jitsi (meet.jit.si)]
