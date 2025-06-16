const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const pool = require('../../config/DB');

JWT_SECRET = process.env.JWT_SECRET


const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');

// Cada intento de respuesta guardarlo en la db
router.post('/RealizarIntento', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});

// Cada ejecucion SQL guardarlo en la db (cuando esta resolviendo SQL)
router.post('/EjecucionSQL', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});

// Cada vez que utiliza las funciones IA
router.post('/ConsultaIA', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});
