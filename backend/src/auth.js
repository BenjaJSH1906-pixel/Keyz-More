// Autenticación del administrador: login con usuario/clave del .env + token JWT.
import crypto from 'node:crypto'; // Módulo nativo de Node para funciones criptográficas (hash y comparación segura)
import jwt from 'jsonwebtoken'; // Librería para firmar y verificar tokens JWT

// Comparación en tiempo constante (evita ataques por temporización)
function safeEqual(a = '', b = '') {
  // Hashea ambos valores a longitud fija (SHA-256) para evitar filtrar longitudes mediante timingSafeEqual
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  // Compara los buffers de bytes en tiempo constante sin cortocircuitos
  return crypto.timingSafeEqual(ha, hb);
}

// Controlador de inicio de sesión: valida credenciales contra variables de entorno y emite un JWT
export function login(req, res) {
  // Extrae usuario y contraseña enviados en el cuerpo de la petición POST
  const { username, password } = req.body || {};
  // Verifica credenciales de forma segura contra ADMIN_USER y ADMIN_PASSWORD del entorno
  const okUser = safeEqual(username, process.env.ADMIN_USER);
  const okPass = safeEqual(password, process.env.ADMIN_PASSWORD);

  // Rechaza el acceso con estado 401 si cualquiera de los dos datos no coincide
  if (!(okUser && okPass)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }
  // Genera un token JWT firmado con JWT_SECRET, payload de rol admin y vigencia de 2 horas
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });
  // Devuelve el token al cliente para futuras peticiones autenticadas
  res.json({ token });
}

// Middleware: protege las rutas /api/admin/*
export function requireAdmin(req, res, next) {
  // Lee la cabecera Authorization de la petición entrante
  const header = req.headers.authorization || '';
  // Extrae el token si viene bajo el esquema "Bearer <token>"
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  // Bloquea con 401 si no se envió un token Bearer válido
  if (!token) return res.status(401).json({ error: 'No autorizado.' });

  try {
    // Verifica la firma y vigencia del token usando el secreto del servidor
    jwt.verify(token, process.env.JWT_SECRET);
    // Permite continuar hacia el siguiente middleware o controlador de ruta
    next();
  } catch {
    // Responde con 401 si el token es inválido, fue alterado o ya expiró
    res.status(401).json({ error: 'Sesión expirada. Inicia sesión de nuevo.' });
  }
}