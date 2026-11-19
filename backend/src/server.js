// API del proyecto: formulario de contacto y panel de administrador.
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDb, dbReady } from './db.js';
import { login, requireAdmin } from './auth.js';
import Mensaje from './models/Mensaje.js';

// Sin estas variables el servidor no puede funcionar de forma segura
for (const key of ['JWT_SECRET', 'MONGODB_URI', 'ADMIN_USER', 'ADMIN_PASSWORD']) {
  if (!process.env[key]) {
    console.error(`Falta ${key} en el archivo .env`);
    process.exit(1);
  }
}

const app = express();
app.set('trust proxy', 1); // detrás de Render/Railway: el rate limit necesita la IP real
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '20kb' }));

// CORS: en desarrollo cualquier puerto de localhost; en producción, solo FRONTEND_ORIGIN
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
const isLocalOrigin = (o) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o || '');
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || isLocalOrigin(origin) || allowedOrigins.includes(origin)),
}));

// El propio servidor entrega la página (carpeta /frontend): abre http://localhost:3000
const here = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(here, process.env.FRONTEND_DIR || '../../frontend')));

// Límite de solicitudes por IP
const limiter = (max, minutes) =>
  rateLimit({ windowMs: minutes * 60 * 1000, max, standardHeaders: true, legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Intenta más tarde.' } });

// Si la base de datos aún no conectó, responde un error claro en vez de quedarse colgado
const requireDb = (_req, res, next) =>
  dbReady() ? next() : res.status(503).json({ error: 'Base de datos no disponible. Intenta en unos segundos.' });

/* ---------- Público ---------- */

app.get('/api/health', (_req, res) => res.json({ ok: true, db: dbReady() }));

// Validación en el servidor (la del navegador se puede saltar)
function validateContact({ name, email, message }) {
  if (typeof name !== 'string' || name.trim().length < 3 || name.length > 100) return 'Nombre inválido.';
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 150) return 'Correo inválido.';
  if (typeof message !== 'string' || message.trim().length < 10 || message.length > 2000) return 'Mensaje inválido (10 a 2000 caracteres).';
  return null;
}

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

app.post('/api/admin/login', limiter(10, 15), login);

app.get('/api/admin/messages', requireAdmin, requireDb, async (_req, res) => {
  try {
    res.json(await Mensaje.find().sort({ created_at: -1 }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al leer los mensajes.' });
  }
});

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
const PORT = process.env.PORT || 3000;
connectDb();
app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
