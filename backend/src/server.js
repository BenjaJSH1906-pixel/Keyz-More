// API del proyecto: formulario de contacto y panel de administrador.
import 'dotenv/config'; // Carga automáticamente las variables de entorno desde el archivo .env
import path from 'node:path'; // Utilidad nativa para resolver rutas de carpetas y archivos
import { fileURLToPath } from 'node:url'; // Convierte import.meta.url a ruta de archivo en ES Modules
import express from 'express'; // Framework web para crear el servidor y las rutas HTTP
import cors from 'cors'; // Middleware para controlar qué orígenes pueden llamar a la API
import helmet from 'helmet'; // Middleware de seguridad que añade cabeceras HTTP protectoras
import rateLimit from 'express-rate-limit'; // Limita la cantidad de peticiones por IP para frenar abusos o fuerza bruta
import mongoose from 'mongoose'; // ODM para interactuar con MongoDB y validar ObjectIds
import { connectDb, dbReady } from './db.js'; // Funciones de conexión y estado de MongoDB
import { login, requireAdmin } from './auth.js'; // Controlador de login con JWT y middleware de protección admin
import Mensaje from './models/Mensaje.js'; // Modelo de Mongoose para la colección de mensajes

// Sin estas variables el servidor no puede funcionar de forma segura
// Detiene el arranque inmediatamente si falta alguna variable crítica en el entorno
for (const key of ['JWT_SECRET', 'MONGODB_URI', 'ADMIN_USER', 'ADMIN_PASSWORD']) {
  if (!process.env[key]) {
    console.error(`Falta ${key} en el archivo .env`);
    process.exit(1);
  }
}

// Inicializa la aplicación de Express y configura seguridad, proxy y parseo JSON
const app = express();
app.set('trust proxy', 1); // detrás de Render/Railway: el rate limit necesita la IP real
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '20kb' })); // Limita el tamaño del cuerpo JSON para evitar cargas excesivas

// CORS: en desarrollo cualquier puerto de localhost; en producción, solo FRONTEND_ORIGIN
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
const isLocalOrigin = (o) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o || '');
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || isLocalOrigin(origin) || allowedOrigins.includes(origin)),
}));

// El propio servidor entrega la página (carpeta /frontend): abre http://localhost:3000
const here = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(here, process.env.FRONTEND_DIR || '../../frontend')));

// Fábrica de middlewares para limitar solicitudes por ventana de tiempo (en minutos)
const limiter = (max, minutes) =>
  rateLimit({ windowMs: minutes * 60 * 1000, max, standardHeaders: true, legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Intenta más tarde.' } });

// Si la base de datos aún no conectó, responde un error claro en vez de quedarse colgado
const requireDb = (_req, res, next) =>
  dbReady() ? next() : res.status(503).json({ error: 'Base de datos no disponible. Intenta en unos segundos.' });

/* ---------- Público ---------- */

// Endpoint de verificación de estado del servidor y conexión a la base de datos
app.get('/api/health', (_req, res) => res.json({ ok: true, db: dbReady() }));

// Validación en el servidor (la del navegador se puede saltar)
function validateContact({ name, email, message }) {
  if (typeof name !== 'string' || name.trim().length < 3 || name.length > 100) return 'Nombre inválido.';
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 150) return 'Correo inválido.';
  if (typeof message !== 'string' || message.trim().length < 10 || message.length > 2000) return 'Mensaje inválido (10 a 2000 caracteres).';
  return null;
}

// Recibe mensajes del formulario de contacto (máx. 5 envíos cada 15 min por IP) y los guarda en MongoDB
app.post('/api/contact', limiter(5, 15), requireDb, async (req, res) => {
  const error = validateContact(req.body || {});
  if (error) return res.status(400).json({ error });

  try {
    const { name, email, message } = req.body;
    await Mensaje.create({ name, email, message });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No pudimos guardar tu mensaje. Intenta de nuevo.' });
  }
});

/* ---------- Admin (protegido con token) ---------- */

// Inicia sesión del administrador (máx. 10 intentos cada 15 min por IP) y emite un JWT
app.post('/api/admin/login', limiter(10, 15), login);

// Devuelve todos los mensajes ordenados del más reciente al más antiguo (requiere token JWT válido)
app.get('/api/admin/messages', requireAdmin, requireDb, async (_req, res) => {
  try {
    res.json(await Mensaje.find().sort({ created_at: -1 }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al leer los mensajes.' });
  }
});

// Elimina un mensaje por su ID de MongoDB tras validar el formato ObjectId y el token JWT
app.delete('/api/admin/messages/:id', requireAdmin, requireDb, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID inválido.' });
  try {
    await Mensaje.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo eliminar.' });
  }
});

/* ---------- Arranque ---------- */
// Inicia la conexión a MongoDB y levanta el servidor HTTP en el puerto configurado
const PORT = process.env.PORT || 3000;
connectDb();
app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));