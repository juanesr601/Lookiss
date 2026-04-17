// config.js — Configuración central de la app
// Cambia VITE_API_URL en .env para producción

export const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3001';

export const API_URL = `${API_BASE}/api`;

// Construye la URL completa de una imagen guardada en el backend
export const mediaUrl = (path) => (path ? `${API_BASE}${path}` : '');
