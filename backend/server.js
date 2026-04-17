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
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsers (ANTES de las rutas) ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logger de peticiones (solo en desarrollo) ─────────────────────────────────
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

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'Lookiss API v5' }));

// ── Error handler global ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error no capturado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🌸 Lookiss API → http://localhost:${PORT}`);
  console.log(`   Health:      http://localhost:${PORT}/api/health`);
});
