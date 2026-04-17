import sqlite3pkg from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const sqlite3 = sqlite3pkg.verbose();
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'lookiss.db');
const raw = new sqlite3.Database(dbPath);

raw.serialize(() => {
  raw.run('PRAGMA journal_mode = WAL');
  raw.run('PRAGMA foreign_keys = ON');
});

const db = {
  run: (sql, params = []) =>
    new Promise((resolve, reject) =>
      raw.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      })
    ),
  get: (sql, params = []) =>
    new Promise((resolve, reject) =>
      raw.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row ?? null);
      })
    ),
  all: (sql, params = []) =>
    new Promise((resolve, reject) =>
      raw.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows ?? []);
      })
    ),
  exec: (sql) =>
    new Promise((resolve, reject) =>
      raw.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      })
    ),
};

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    location TEXT DEFAULT '',
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    image TEXT DEFAULT '',
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS likes (
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS saved_posts (
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    post_id TEXT,
    read INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export default db;
