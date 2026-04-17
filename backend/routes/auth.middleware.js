import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lookiss_secret_2024_change_in_production';

export const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const generateToken = (user) =>
  jwt.sign({ id: user.id, handle: user.handle, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
