import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from './auth.middleware.js';

const router = Router();

const safeUser = async (user, viewerId) => {
  if (!user) return null;
  const { password, email, ...safe } = user;
  const fRow = await db.get('SELECT COUNT(*) as c FROM follows WHERE following_id = ?', [user.id]);
  const fgRow = await db.get('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?', [user.id]);
  const pRow = await db.get('SELECT COUNT(*) as c FROM posts WHERE user_id = ?', [user.id]);
  const isFollowingRow = viewerId
    ? await db.get('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?', [viewerId, user.id])
    : null;
  return {
    ...safe,
    followers: fRow?.c ?? 0,
    following: fgRow?.c ?? 0,
    posts_count: pRow?.c ?? 0,
    isFollowing: !!isFollowingRow,
  };
};

router.get('/suggestions/all', authMiddleware, async (req, res) => {
  try {
    const users = await db.all(`
      SELECT * FROM users
      WHERE id != ?
        AND id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
      ORDER BY created_at DESC LIMIT 10
    `, [req.user.id, req.user.id]);
    const result = await Promise.all(users.map(u => safeUser(u, req.user.id)));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/search/:q', authMiddleware, async (req, res) => {
  try {
    const q = `%${req.params.q}%`;
    const users = await db.all('SELECT * FROM users WHERE name LIKE ? OR handle LIKE ? LIMIT 20', [q, q]);
    const result = await Promise.all(users.map(u => safeUser(u, req.user.id)));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  res.json(await safeUser(user, req.user.id));
});

router.get('/:handle', authMiddleware, async (req, res) => {
  const user = await db.get('SELECT * FROM users WHERE handle = ?', [req.params.handle]);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(await safeUser(user, req.user.id));
});


router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, bio, location } = req.body;
    await db.run('UPDATE users SET name = ?, bio = ?, location = ? WHERE id = ?',
      [name || req.user.name, bio || '', location || '', req.user.id]);
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json(await safeUser(user, req.user.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
    const existing = await db.get('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
    if (existing) {
      await db.run('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
    } else {
      await db.run('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.user.id, req.params.id]);
      await db.run('INSERT INTO notifications (id, user_id, from_user_id, type) VALUES (?, ?, ?, ?)',
        [uuidv4(), req.params.id, req.user.id, 'follow']);
    }
    res.json({ following: !existing });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
