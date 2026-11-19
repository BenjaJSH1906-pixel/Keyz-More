// Panel de administrador. Habla con la API protegida usando un token JWT.
const API = window.API_URL; // URL base del backend definida en config.js
const $ = (id) => document.getElementById(id); // Atajo para obtener elementos por su ID
const TOKEN_KEY = 'admin_token'; // sessionStorage: se borra al cerrar la pestaña

// Recupera el token JWT guardado en la sesión actual del navegador
const getToken = () => sessionStorage.getItem(TOKEN_KEY);

// Helper de fetch que adjunta el token Bearer y maneja respuestas 401 (no autorizado / expirado) o errores HTTP
async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/api/admin/login') { logout(); throw new Error(data.error || 'Sesión expirada.'); }
  if (!res.ok) throw new Error(data.error || 'Error del servidor.');
  return data;
}

// Alterna entre la pantalla de login y el panel de administración según el estado de sesión
function showView(loggedIn) {
  $('login-view').hidden = loggedIn;
  $('dash-view').hidden = !loggedIn;
}

// Elimina el token de sesión y vuelve a mostrar la vista de login
function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  showView(false);
}

/* ---------- Login ---------- */
// Envía credenciales al backend para obtener el token JWT y cargar los mensajes
$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('login-btn');
  btn.disabled = true; btn.textContent = 'Entrando...'; $('login-error').textContent = '';
  try {
    const res = await fetch(`${API}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: $('username').value, password: $('password').value }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión.');
    sessionStorage.setItem(TOKEN_KEY, data.token);
    $('password').value = '';
    showView(true);
    loadMessages();
  } catch (err) {
    $('login-error').textContent = err.message === 'Failed to fetch' ? 'No hay conexión con el servidor.' : err.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Entrar';
  }
});

// Cierra sesión al pulsar el botón de salir
$('logout-btn').addEventListener('click', logout);

/* ---------- Mensajes ---------- */
// Crea una celda <td> segura usando textContent para evitar inyección de HTML/scripts (XSS)
function td(text, cls) {
  const el = document.createElement('td');
  if (cls) el.className = cls;
  el.textContent = text; // textContent: un mensaje malicioso con <script> no se ejecuta
  return el;
}

// Consulta los mensajes desde la API protegida, renderiza la tabla y configura el botón de eliminar
async function loadMessages() {
  $('dash-status').textContent = 'Cargando mensajes...';
  try {
    const rows = await api('/api/admin/messages');
    const tbody = $('rows');
    tbody.replaceChildren();

    rows.forEach((r) => {
      const tr = document.createElement('tr');
      tr.append(
        td(new Date(r.created_at).toLocaleString('es-EC'), 'date'),
        td(r.name),
        td(r.email),
        td(r.message, 'msg'),
      );
      const actionTd = document.createElement('td');
      const del = document.createElement('button');
      del.className = 'danger'; del.textContent = 'Eliminar';
      // Solicita confirmación y envía DELETE al backend para borrar el mensaje seleccionado
      del.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este mensaje?')) return;
        del.disabled = true;
        try { await api(`/api/admin/messages/${r.id}`, { method: 'DELETE' }); loadMessages(); }
        catch (err) { alert(err.message); del.disabled = false; }
      });
      actionTd.appendChild(del);
      tr.appendChild(actionTd);
      tbody.appendChild(tr);
    });

    $('count').textContent = `(${rows.length})`;
    $('dash-status').textContent = rows.length ? '' : 'Todavía no hay mensajes.';
  } catch (err) {
    $('dash-status').textContent = err.message;
  }
}

/* ---------- Abrir / cerrar la ventana ---------- */
// Controla la apertura y cierre del modal <dialog> del panel administrativo
const dialog = $('admin-dialog');

$('open-admin').addEventListener('click', (e) => {
  e.preventDefault();
  dialog.showModal();
  if (getToken()) { showView(true); loadMessages(); } else { showView(false); }
});
$('admin-close').addEventListener('click', () => dialog.close());
// Cerrar al hacer clic fuera del contenido
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });