import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from './auth.middleware.js';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

const enrichPost = async (post, userId) => {
  const [likesRow, likedRow, savedRow, commentsRow, author] = await Promise.all([
    db.get('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [post.id]),
    userId ? db.get('SELECT 1 as v FROM likes WHERE post_id = ? AND user_id = ?', [post.id, userId]) : null,
    userId ? db.get('SELECT 1 as v FROM saved_posts WHERE post_id = ? AND user_id = ?', [post.id, userId]) : null,
    db.get('SELECT COUNT(*) as count FROM comments WHERE post_id = ?', [post.id]),
    db.get('SELECT id, name, handle, avatar FROM users WHERE id = ?', [post.user_id]),
  ]);
  return {
    ...post,
    likes:          likesRow?.count    ?? 0,
    liked:          !!likedRow,
    saved:          !!savedRow,
    comments_count: commentsRow?.count ?? 0,
    author,
  };
};

// ── GET /api/posts/saved/mine  (antes de /:id) ────────────────────────────────
router.get('/saved/mine', authMiddleware, async (req, res) => {
  try {
    const posts = await db.all(`
      SELECT p.* FROM posts p
      JOIN saved_posts sp ON sp.post_id = p.id
      WHERE sp.user_id = ? ORDER BY sp.created_at DESC
    `, [req.user.id]);
    res.json(await Promise.all(posts.map(p => enrichPost(p, req.user.id))));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/posts/feed ───────────────────────────────────────────────────────
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const posts = await db.all(`
      SELECT p.* FROM posts p
      WHERE p.user_id = ?
         OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
      ORDER BY p.created_at DESC LIMIT 50
    `, [req.user.id, req.user.id]);
    res.json(await Promise.all(posts.map(p => enrichPost(p, req.user.id))));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/posts/explore ────────────────────────────────────────────────────
router.get('/explore', authMiddleware, async (req, res) => {
  try {
    const posts = await db.all('SELECT * FROM posts ORDER BY created_at DESC LIMIT 100', []);
    res.json(await Promise.all(posts.map(p => enrichPost(p, req.user.id))));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/posts/user/:handle ───────────────────────────────────────────────
router.get('/user/:handle', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT id FROM users WHERE handle = ?', [req.params.handle]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const posts = await db.all('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
    res.json(await Promise.all(posts.map(p => enrichPost(p, req.user.id))));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/posts ───────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const text  = (req.body?.text  ?? '').toString().trim();
    const image = (req.body?.image ?? '').toString().trim();

    // Necesita al menos texto O imagen
    if (!text && !image) {
      return res.status(400).json({ error: 'Debes escribir algo o subir una imagen' });
    }

    const id = uuidv4();
    await db.run(
      'INSERT INTO posts (id, user_id, text, image) VALUES (?, ?, ?, ?)',
      [id, req.user.id, text, image]
    );
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [id]);
    res.status(201).json(await enrichPost(post, req.user.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/posts/:id ─────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Sin permiso' });
    await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/posts/:id/like ──────────────────────────────────────────────────
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const existing = await db.get(
      'SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing) {
      await db.run('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    } else {
      await db.run('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, req.params.id]);
      const post = await db.get('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
      if (post && post.user_id !== req.user.id) {
        await db.run(
          'INSERT INTO notifications (id, user_id, from_user_id, type, post_id) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), post.user_id, req.user.id, 'like', req.params.id]
        );
      }
    }
    const row = await db.get('SELECT COUNT(*) as c FROM likes WHERE post_id = ?', [req.params.id]);
    res.json({ liked: !existing, count: row?.c ?? 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/posts/:id/save ──────────────────────────────────────────────────
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const existing = await db.get(
      'SELECT 1 FROM saved_posts WHERE post_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing) {
      await db.run('DELETE FROM saved_posts WHERE post_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    } else {
      await db.run('INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)', [req.user.id, req.params.id]);
    }
    res.json({ saved: !existing });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/posts/:id/comments ───────────────────────────────────────────────
router.get('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await db.all(`
      SELECT c.*, u.name as author_name, u.handle as author_handle, u.avatar as author_avatar
      FROM comments c JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? ORDER BY c.created_at ASC
    `, [req.params.id]);
    res.json(comments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/posts/:id/comments ──────────────────────────────────────────────
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const text = (req.body?.text ?? '').toString().trim();
    if (!text) return res.status(400).json({ error: 'El comentario no puede estar vacío' });

    const id = uuidv4();
    await db.run(
      'INSERT INTO comments (id, post_id, user_id, text) VALUES (?, ?, ?, ?)',
      [id, req.params.id, req.user.id, text]
    );
    const comment = await db.get(`
      SELECT c.*, u.name as author_name, u.handle as author_handle, u.avatar as author_avatar
      FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?
    `, [id]);
    const post = await db.get('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
    if (post && post.user_id !== req.user.id) {
      await db.run(
        'INSERT INTO notifications (id, user_id, from_user_id, type, post_id) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), post.user_id, req.user.id, 'comment', req.params.id]
      );
    }
    res.status(201).json(comment);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
