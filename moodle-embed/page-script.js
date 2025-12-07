/**
 * Script para embeber en un recurso "Página" de Moodle.
 *
 * - Detecta datos del usuario (id, username, email, nombre)
 * - Normaliza el nombre del taller / sala
 * - Llama al WebApp de Apps Script (token / heartbeat / leave)
 * - Redirige o incrusta Jitsi
 */

(function() {
    const statusEl = document.getElementById('jitsi-status');

    // ⚠ Reemplaza esta URL por la URL de tu WebApp de Apps Script:
    const WEBAPP_URL = "https://script.google.com/macros/s/YOUR_WEBAPP_DEPLOYMENT_ID/exec";

    const HEARTBEAT_INTERVAL = 45000;

    function log(msg) {
        if (statusEl) statusEl.innerHTML += "<br>• " + msg;
        console.log("[JITSI]", msg);
    }

    try {
            log("Inicializando script...");

            // =============================
            // 1) Leer username / email / nombre desde el HTML
            // =============================
            const domUserEl = document.getElementById('mw-username');
            const domEmailEl = document.getElementById('mw-email');
            const domNameEl = document.getElementById('mw-fullname');

            const usernameFromDom = domUserEl ? domUserEl.textContent.trim() : "";
            const emailFromDom = domEmailEl ? domEmailEl.textContent.trim() : "";
            const fullnameFromDom = domNameEl ? domNameEl.textContent.trim() : "";

            // =============================
            // 2) Intentar también usar M.cfg si existe (por si algún día lo corrigen)
            // =============================
            const moodleCfg = (window.M && M.cfg) ? M.cfg : {};

            let moodle_user_id = moodleCfg.userid || ""; // puede venir 0
            let full_name = "";

            if (moodleCfg.userfullname) {
                full_name = moodleCfg.userfullname;
            } else {
                const fn = moodleCfg.firstname || "";
                const ln = moodleCfg.lastname || "";
                full_name = (fn + " " + ln).trim();
            }

            const emailFromCfg =
                moodleCfg.email ||
                moodleCfg.useremail ||
                "";

            // =============================
            // 3) Unificamos: prioridad DOM, luego M.cfg
            // =============================
            const username = usernameFromDom || "";
            const email = emailFromDom || emailFromCfg || "";
            const nameUsed = fullnameFromDom || full_name || username || "";

            if (!moodle_user_id) {
                // Si no tenemos id numérico, usamos username como identificador
                moodle_user_id = username || "0";
            }

            log(
                "Detectado usuario: id=" + moodle_user_id +
                ", username='" + username + "'" +
                ", nombre='" + nameUsed + "'" +
                ", email='" + email + "'"
            );

            // ===== título / código taller =====
            const tituloEl = document.querySelector("h2, .page-header-headings h1, .page-title");
            let codigo_taller = tituloEl ? tituloEl.innerText.trim() : "Taller-Desconocido";
            log("Código taller: " + codigo_taller);

            function normalizarNombreSala(nombre) {
                let s = nombre;
                s = s.split('|').join('-');
                s = s.split('(').join('');
                s = s.split(')').join('');
                s = s.split(':').join('-');
                while (s.indexOf('  ') !== -1) {
                    s = s.replace('  ', ' ');
                }
                return s.trim();
            }

            const jitsiRoomName = normalizarNombreSala(codigo_taller);
            const jitsiRoom = encodeURIComponent(jitsiRoomName);
            log("Sala Jitsi normalizada: " + jitsiRoomName);

            // ===== función sendData con Image + GET =====
            function sendData(path, payload) {
                log("Enviando beacon GET path=" + path);
                const params = new URLSearchParams();
                params.append('path', path);
                for (const key in payload) {
                    if (payload[key] !== undefined && payload[key] !== null) {
                        params.append(key, String(payload[key]));
                    }
                }
                const img = new Image();
                img.src = WEBAPP_URL + "?" + params.toString();
            }

            // ===== payload principal =====
            const sessionPayload = {
                codigo_taller: codigo_taller,
                moodle_user_id: moodle_user_id,
                username: username, // ahora viene del DOM
                full_name: nameUsed, // nombre bonito o username
                email: email,
                role: (moodleCfg.userrole || "student"),
                user_agent: navigator.userAgent,
                course_id: "",
                cohort_id: codigo_taller,
                jitsi_url: "https://meet.jit.si/" + jitsiRoom // se guarda en extra_info
            };

            log("Enviando token...");
            sendData("token", sessionPayload);

            // heartbeats
            let hbInterval = setInterval(() => {
                const hbPayload = {
                    codigo_taller: codigo_taller,
                    moodle_user_id: moodle_user_id
                };
                sendData("heartbeat", hbPayload);
            }, HEARTBEAT_INTERVAL);

            window.addEventListener("beforeunload", () => {
                clearInterval(hbInterval);
                const leavePayload = {
                    codigo_taller: codigo_taller,
                    moodle_user_id: moodle_user_id
                };
                sendData("leave", leavePayload);
            });

            log("Redirigiendo a Jitsi...");
            setTimeout(() => {
                window.location.href = "https://meet.jit.si/" + jitsiRoom;
            }, 1200);

        } catch (e) {
            log("Error en script Jitsi: " + e.message);
            console.error(e);
        }

})();
