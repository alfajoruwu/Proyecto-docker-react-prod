const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const pool = require('../../config/DB');

JWT_SECRET = process.env.JWT_SECRET


const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');


router.post('/EjecutarQWERY', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});


router.get('/ObtenerTablas', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});


router.get('/ObtenerTabla/:nombre', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});




module.exports = router;