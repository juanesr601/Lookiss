import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes          from './routes/auth.routes.js';
import postsRoutes         from './routes/posts.routes.js';
import usersRoutes         from './routes/users.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import uploadRoutes        from './routes/upload.routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL, // URL de Vercel — agrégala en Railway Variables
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, mobile, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logger ────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log(`[${req.method}] ${req.path}`, JSON.stringify(req.body).slice(0, 120));
  }
  next();
});

// ── Archivos estáticos ────────────────────────────────────────────────────────
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/posts',         postsRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/upload',        uploadRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'Lookiss API' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Escuchar en 0.0.0.0 para que Railway pueda exponerlo ─────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌸 Lookiss API → http://0.0.0.0:${PORT}`);
  console.log(`   Health:      http://localhost:${PORT}/api/health`);
});
