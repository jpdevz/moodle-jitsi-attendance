/************************************************************
 *     SISTEMA DE ASISTENCIA JITSI – VERSIÓN 2.3 FINAL
 *     Ajustado EXACTAMENTE a la estructura de tus Google Sheets
 ************************************************************/

const SPREADSHEET_ID = '1HMcMqpW-SkqRmCn-Z6HeLJ0JH2oC8wKYcfz_2yfD3Xw';

const SHEET_USERS      = 'users';
const SHEET_ROOMS      = 'rooms';
const SHEET_SESSIONS   = 'sessions';
const SHEET_HEARTBEATS = 'heartbeats';

const TIMEZONE = 'America/Santiago';

function _sheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function _nowIso() {
  const now = new Date();
  return Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
}

/************************************************************
 * USERS  (6 columnas)
 * A moodle_user_id
 * B full_name
 * C email
 * D first_seen_at
 * E last_seen_at
 * F visits
 ************************************************************/
function upsertUser(moodle_user_id, full_name, email) {
  const sh = _sheet(SHEET_USERS);
  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(moodle_user_id)) {
      // actualizar
      const visits = Number(data[i][5] || 0) + 1;

      sh.getRange(i + 1, 2).setValue(full_name);
      sh.getRange(i + 1, 3).setValue(email);
      sh.getRange(i + 1, 5).setValue(_nowIso()); // last_seen_at
      sh.getRange(i + 1, 6).setValue(visits);
      return;
    }
  }

  // insertar nuevo
  sh.appendRow([
    moodle_user_id,
    full_name,
    email,
    _nowIso(),  // first_seen_at
    _nowIso(),  // last_seen_at
    1           // visits
  ]);
}

/************************************************************
 * ROOMS  (5 columnas)
 * A room_name
 * B course_id
 * C cohort_id   ← VALOR RECORTADO
 * D created_at
 * E updated_at
 ************************************************************/
function extractCohort(full_title) {
  if (!full_title) return "";
  const parts = full_title.split(" - ");
  return parts.length >= 2 ? parts[0] + " - " + parts[1] : full_title;
}

function upsertRoom(room_name, full_title, jitsi_url) {
  const cohort_id = extractCohort(full_title);

  const sh = _sheet(SHEET_ROOMS);
  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(room_name)) {
      // actualizar updated_at
      sh.getRange(i + 1, 5).setValue(_nowIso());
      return;
    }
  }

  sh.appendRow([
    room_name,
    cohort_id, // course_id (dejamos igual)
    cohort_id, // cohort_id (recortado)
    _nowIso(), // created_at
    _nowIso()  // updated_at
  ]);
}

/************************************************************
 * SESSIONS
 ************************************************************/
function nextSessionId() {
  const sh = _sheet(SHEET_SESSIONS);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return 1;

  const id = Number(sh.getRange(lastRow, 1).getValue());
  return isNaN(id) ? 1 : id + 1;
}

function findOpenSession(moodle_user_id, room_name, options) {
  const sh = _sheet(SHEET_SESSIONS);
  const data = sh.getDataRange().getValues();
  const now = new Date();

  const maxHours = options && typeof options.maxHours === "number"
    ? options.maxHours
    : null; // si es null, NO aplicamos límite de horas

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const uid     = String(row[1]); // B: moodle_user_id
    const rname   = row[2];         // C: room_name
    const leftAt  = row[5];         // F: left_at
    const joined  = row[4];         // E: joined_at

    if (uid === String(moodle_user_id) && rname === room_name && !leftAt) {
      // Si no queremos límite de horas → retornamos de inmediato
      if (maxHours === null) {
        return row[0]; // session_id
      }

      // Con límite de horas: intentamos medir la antigüedad
      let joinedDate;
      if (joined instanceof Date) {
        joinedDate = joined;
      } else {
        joinedDate = new Date(joined);
      }

      if (isNaN(joinedDate.getTime())) {
        // Si no pudimos parsear bien la fecha, por seguridad la consideramos válida
        return row[0];
      }

      const diffMs    = now - joinedDate;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours <= maxHours) {
        return row[0];
      }
      // si se pasó del máximo, se considera cerrada "lógicamente"
    }
  }

  // No se encontró sesión abierta válida
  return null;
}


function detectRole(full_name, roleFromMoodle) {
  if (!full_name) return roleFromMoodle;

  const lower = full_name.toLowerCase();
  if (lower.startsWith("prof.") || lower.startsWith("prof ") || lower.startsWith("profesor")) {
    return "teacher";
  }

  return roleFromMoodle; // normalmente "student"
}

function openOrReuseSession(moodle_user_id, room_name, full_name, user_agent, jitsi_url, roleFromMoodle) {
  // Aquí SÍ queremos respetar el límite de horas (ej: 6)
  const existing = findOpenSession(moodle_user_id, room_name, { maxHours: 6 });
  if (existing) return existing;

  const sh = _sheet(SHEET_SESSIONS);
  const sid = nextSessionId();
  const role = detectRole(full_name, roleFromMoodle);

  sh.appendRow([
    sid,
    moodle_user_id,
    room_name,
    role,
    _nowIso(),
    "",
    "",
    user_agent,
    jitsi_url
  ]);

  return sid;
}

function closeSession(session_id) {
  const sh = _sheet(SHEET_SESSIONS);
  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(session_id) && !data[i][5]) {
      const joined = new Date(data[i][4]);
      const now = new Date();
      const dur = Math.max(0, Math.floor((now - joined) / 1000));

      sh.getRange(i + 1, 6).setValue(_nowIso());
      sh.getRange(i + 1, 7).setValue(dur);

      return { closed: true, duration_seconds: dur };
    }
  }

  return { closed: false };
}

/************************************************************
 * HEARTBEATS
 ************************************************************/
function pushHeartbeat(session_id) {
  _sheet(SHEET_HEARTBEATS).appendRow([session_id, _nowIso()]);
}

/************************************************************
 * API
 ************************************************************/
function doGet(e) {
  const p = e.parameter || {};
  const path = p.path;

  if (path === "token")     return handleToken(p);
  if (path === "heartbeat") return handleHeartbeat(p);
  if (path === "leave")     return handleLeave(p);

  return _json({ ok: true });
}

function handleToken(req) {
  const room = req.codigo_taller || "SIN_TALLER";
  const muid = req.moodle_user_id || "0";
  const full = req.full_name || req.username || "";
  const email = req.email || "";
  const role = req.role || "student";
  const ua = req.user_agent || "";
  const jitsi_url = req.jitsi_url || "";

  upsertUser(muid, full, email);
  upsertRoom(room, req.codigo_taller, jitsi_url);

  const sid = openOrReuseSession(muid, room, full, ua, jitsi_url, role);
  return _json({ ok: true, session_id: sid });
}

function handleHeartbeat(req) {
  // Para heartbeats también queremos respetar el límite de horas
  const sid = findOpenSession(req.moodle_user_id, req.codigo_taller, { maxHours: 6 });
  if (!sid) return _json({ ok: false, reason: "no open session" });

  pushHeartbeat(sid);
  return _json({ ok: true, session_id: sid });
}

function handleLeave(req) {
  // PARA LEAVE NO APLICAMOS LÍMITE DE HORAS → maxHours = null
  const sid = findOpenSession(req.moodle_user_id, req.codigo_taller, null);
  if (!sid) return _json({ ok: false, reason: "no open session" });

  const res = closeSession(sid);
  return _json(Object.assign({ ok: true, session_id: sid }, res));
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
