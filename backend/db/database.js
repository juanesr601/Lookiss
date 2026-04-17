import pg from 'pg';

const { Pool } = pg;

// En Railway, DATABASE_URL se inyecta automáticamente
// En local, usa SQLite-compatible via la variable de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

const db = {
  // Trae UNA fila
  get: async (sql, params = []) => {
    const sqlPg = toPgSql(sql);
    const res = await pool.query(sqlPg, params);
    return res.rows[0] ?? null;
  },

  // Trae TODAS las filas
  all: async (sql, params = []) => {
    const sqlPg = toPgSql(sql);
    const res = await pool.query(sqlPg, params);
    return res.rows;
  },

  // Inserta / actualiza / borra
  run: async (sql, params = []) => {
    const sqlPg = toPgSql(sql);
    const res = await pool.query(sqlPg, params);
    return { changes: res.rowCount };
  },

  // Ejecutar SQL directo (para crear tablas)
  exec: async (sql) => {
    await pool.query(sql);
  },
};

// SQLite usa ? como placeholder, PostgreSQL usa $1 $2 $3
function toPgSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// Crear tablas al iniciar
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    handle     TEXT UNIQUE NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    bio        TEXT DEFAULT '',
    avatar     TEXT DEFAULT '',
    location   TEXT DEFAULT '',
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
  );

  CREATE TABLE IF NOT EXISTS posts (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    text       TEXT DEFAULT '',
    image      TEXT DEFAULT '',
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS likes (
    user_id    TEXT NOT NULL,
    post_id    TEXT NOT NULL,
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
    PRIMARY KEY (user_id, post_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id         TEXT PRIMARY KEY,
    post_id    TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    text       TEXT NOT NULL,
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
  );

  CREATE TABLE IF NOT EXISTS follows (
    follower_id  TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at   BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
    PRIMARY KEY (follower_id, following_id)
  );

  CREATE TABLE IF NOT EXISTS saved_posts (
    user_id    TEXT NOT NULL,
    post_id    TEXT NOT NULL,
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
    PRIMARY KEY (user_id, post_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL,
    from_user_id TEXT NOT NULL,
    type         TEXT NOT NULL,
    post_id      TEXT,
    read         INTEGER DEFAULT 0,
    created_at   BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
  );
`);

console.log('✅ Base de datos PostgreSQL conectada y lista');

export default db;
