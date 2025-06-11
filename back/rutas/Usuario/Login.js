const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const pool = require('../../config/DB');

JWT_SECRET = process.env.JWT_SECRET


router.post('/register', async (req, res) => {
  let { nombre, email, password, confirmPass } = req.body;

  let rol = 'usuario'

  if (!nombre || !email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

  email = email.toLowerCase();

  if (password != confirmPass) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El email no es válido' });
  }

  const checkUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  if (checkUser.rows.length > 0) return res.status(400).json({ error: 'El email ya está registrado' });

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($4, $1, $2, $3)',
    [email, hashedPassword, rol, nombre]
  );
  res.status(201).json({ message: 'Usuario creado correctamente' });
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  if (result.rows.length === 0) return res.status(400).json({ error: 'Correo no registrado' });

  const usuario = result.rows[0];
  const esValida = await bcrypt.compare(password, usuario.password);

  if (!esValida) return res.status(400).json({ error: 'Contraseña incorrecta' });

  const accessToken = jwt.sign({ id: usuario.id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: usuario.id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ accessToken, refreshToken });
});


router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token requerido' });

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const accessToken = jwt.sign({ id: decoded.id, rol: decoded.rol }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Refresh token inválido o expirado' });
  }
});


module.exports = router;