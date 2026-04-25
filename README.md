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

