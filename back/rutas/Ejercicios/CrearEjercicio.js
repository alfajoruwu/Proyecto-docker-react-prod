const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const pool = require('../../config/DB');

JWT_SECRET = process.env.JWT_SECRET


const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');


router.post('/CrearEjercicio', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});


router.get('/ObtenerEjercicios', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});


router.get('/ObtenerEjercicio/:id', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});


router.put('/editarEjercicio', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});


router.delete('/BorrarEjercicio', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});


module.exports = router;