// Panel de administrador. Habla con la API protegida usando un token JWT.
const API = window.API_URL;
const $ = (id) => document.getElementById(id);
const TOKEN_KEY = 'admin_token'; // sessionStorage: se borra al cerrar la pestaña

const getToken = () => sessionStorage.getItem(TOKEN_KEY);

// fetch con token; si el servidor responde 401, cierra la sesión
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

function showView(loggedIn) {
  $('login-view').hidden = loggedIn;
  $('dash-view').hidden = !loggedIn;
}

function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  showView(false);
}

/* ---------- Login ---------- */
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

$('logout-btn').addEventListener('click', logout);

/* ---------- Mensajes ---------- */
function td(text, cls) {
  const el = document.createElement('td');
  if (cls) el.className = cls;
  el.textContent = text; // textContent: un mensaje malicioso con <script> no se ejecuta
  return el;
}

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
const dialog = $('admin-dialog');

$('open-admin').addEventListener('click', (e) => {
  e.preventDefault();
  dialog.showModal();
  if (getToken()) { showView(true); loadMessages(); } else { showView(false); }
});
$('admin-close').addEventListener('click', () => dialog.close());
// Cerrar al hacer clic fuera del contenido
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
