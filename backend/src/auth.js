// Autenticación del administrador: login con usuario/clave del .env + token JWT.
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

// Comparación en tiempo constante (evita ataques por temporización)
function safeEqual(a = '', b = '') {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function login(req, res) {
  const { username, password } = req.body || {};
  const okUser = safeEqual(username, process.env.ADMIN_USER);
  const okPass = safeEqual(password, process.env.ADMIN_PASSWORD);

  if (!(okUser && okPass)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
}

// Middleware: protege las rutas /api/admin/*
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado.' });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sesión expirada. Inicia sesión de nuevo.' });
  }
}
