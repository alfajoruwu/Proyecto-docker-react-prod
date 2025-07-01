const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// authMiddleware ahora permite usuarios invitados
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // Asignamos un rol "invitado" al req.user
    req.user = {
      rol: 'invitado',
      esInvitado: true,
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token inválido o expirado');
    res.status(402).json({ error: 'Token inválido o expirado' });
  }
};

// Verifica permite ahora validar también contra "invitado"
const Verifica = (...rolesPermitidos) => {
  return (req, res, next) => {
    const { user } = req;

    // Si el usuario es invitado y está permitido, continuar
    if (user.esInvitado && rolesPermitidos.includes('invitado')) {
      return next();
    }

    // Si el usuario tiene un rol permitido, continuar
    if (user && user.rol && rolesPermitidos.includes(user.rol)) {
      return next();
    }

    // Si llega aquí, no tiene permiso
    return res.status(403).json({ error: 'Acceso denegado. No tienes permiso suficiente.' });
  };
};

module.exports = { authMiddleware, Verifica };