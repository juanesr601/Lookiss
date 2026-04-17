// config.js — Configuración central de la app
// Cambia VITE_API_URL en .env para producción

export const API_BASE = 'https://tu-backend.up.railway.app';
//                       ↑ pega aquí tu URL real de Railway

export const API_URL = `${API_BASE}/api`;

export const mediaUrl = (path) => (path ? `${API_BASE}${path}` : '');