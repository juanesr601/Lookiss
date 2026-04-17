import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { generateToken } from './auth.middleware.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, handle, email, password } = req.body;
    if (!name || !handle || !email || !password)
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const exists = await db.get('SELECT id FROM users WHERE email = ? OR handle = ?', [email, handle]);
    if (exists) return res.status(409).json({ error: 'Email o handle ya en uso' });

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await db.run('INSERT INTO users (id, name, handle, email, password) VALUES (?, ?, ?, ?, ?)',
      [id, name, handle.toLowerCase(), email.toLowerCase(), hashed]);

    const user = await db.get('SELECT id, name, handle, email, bio, avatar, location, created_at FROM users WHERE id = ?', [id]);
    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña requeridos' });

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const { password: _, ...safeUser } = user;
    const token = generateToken(safeUser);
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
