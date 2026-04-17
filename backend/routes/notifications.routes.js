import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from './auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifs = await db.all(`
      SELECT n.*, u.name as from_name, u.handle as from_handle, u.avatar as from_avatar
      FROM notifications n JOIN users u ON n.from_user_id = u.id
      WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 30
    `, [req.user.id]);
    res.json(notifs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/read-all', authMiddleware, async (req, res) => {
  await db.run('UPDATE notifications SET read = 1 WHERE user_id = ?', [req.user.id]);
  res.json({ ok: true });
});

export default router;
