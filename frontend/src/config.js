// ═══════════════════════════════════════════════════════════
// config.js — Configuración central de Lookiss
//
// IMPORTANTE: Reemplaza la URL de abajo con la URL real
// que Railway te generó en:
// Settings → Networking → Public Domain
// ═══════════════════════════════════════════════════════════

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_URL = `${API_BASE}/api`;

// Construye la URL completa de una imagen
export const mediaUrl = (path) => (path ? `${API_BASE}${path}` : '');
