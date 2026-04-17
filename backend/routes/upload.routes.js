import { Router } from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from './auth.middleware.js';
import db from '../db/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

const storage = (folder) =>
  multer.diskStorage({
    destination: join(__dirname, '..', 'uploads', folder),
    filename: (req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });

const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp)'), false);
};

const uploadPost   = multer({ storage: storage('posts'),   fileFilter: imageFilter, limits: { fileSize: 8 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: storage('avatars'), fileFilter: imageFilter, limits: { fileSize: 3 * 1024 * 1024 } });

router.post('/post-image', authMiddleware, uploadPost.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
  const url = `/uploads/posts/${req.file.filename}`;
  res.json({ url });
});

router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
  const url = `/uploads/avatars/${req.file.filename}`;
  await db.run('UPDATE users SET avatar = ? WHERE id = ?', [url, req.user.id]);
  res.json({ url });
});

router.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE')
    return res.status(413).json({ error: 'La imagen es demasiado grande' });
  if (err?.message) return res.status(400).json({ error: err.message });
  next(err);
});

export default router;
