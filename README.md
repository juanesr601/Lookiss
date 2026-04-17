# 💗 Lookiss — Red Social

Red social tipo Facebook construida con React + Vite (frontend) y Node.js + Express + SQLite (backend).

---

## 🏗️ Stack Tecnológico

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite + React Router    |
| Estado     | Zustand                           |
| HTTP       | Axios                             |
| Backend    | Node.js + Express                 |
| Base Datos | SQLite (`sqlite3` — compatible con Windows) |
| Auth       | JWT + bcryptjs                    |

> ✅ Se usa `sqlite3` (puro JS) en lugar de `better-sqlite3` para evitar problemas de compilación en Windows.

---

## 🚀 Instalación paso a paso

### Requisitos previos
- Node.js 18+ → https://nodejs.org
- npm (viene con Node)

### 1. Descomprimir el proyecto
```
Descomprimir lookiss.zip en una carpeta
```

### 2. Instalar dependencias del Backend
```bash
cd lookiss/backend
npm install
```

### 3. Instalar dependencias del Frontend
```bash
cd lookiss/frontend
npm install
```

### 4. Arrancar el Backend (Terminal 1)
```bash
cd lookiss/backend
npm run dev
# ✅ Corre en http://localhost:3001
```

### 5. Arrancar el Frontend (Terminal 2)
```bash
cd lookiss/frontend
npm run dev
# ✅ Corre en http://localhost:5173
```

### 6. Abrir la app
Visita **http://localhost:5173** y regístrate con un nuevo usuario.

---

## 📁 Estructura del Proyecto

```
lookiss/
├── backend/
│   ├── db/
│   │   └── database.js        # SQLite async wrapper
│   ├── routes/
│   │   ├── auth.middleware.js
│   │   ├── auth.routes.js
│   │   ├── posts.routes.js
│   │   ├── users.routes.js
│   │   └── notifications.routes.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/        # Avatar, PostCard, Composer, Sidebar...
    │   ├── pages/             # Home, Explore, Profile, Login...
    │   ├── store/authStore.js
    │   ├── App.jsx
    │   └── api.js
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ✨ Funcionalidades

- Registro y login con JWT
- Feed personalizado (posts de usuarios que sigues)
- Crear y eliminar posts
- Likes y comentarios en tiempo real
- Guardar posts
- Explorar y buscar usuarios
- Seguir / dejar de seguir
- Página de perfil con estadísticas
- Notificaciones (likes, comentarios, nuevos seguidores)

---

## 🔧 Variable de entorno (opcional)

Crear archivo `.env` en `/backend`:
```
PORT=3001
JWT_SECRET=tu_clave_secreta_aqui
```
