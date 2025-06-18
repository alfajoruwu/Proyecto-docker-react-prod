const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const pool = require('../../config/DB');
const NewPool = require('../../config/DB_lectura.js');
const poolCreacion = require('../../config/DB_Creacion.js');

JWT_SECRET = process.env.JWT_SECRET


const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');


router.post('/CrearDB', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { dbName, Descripcion, Resumen, SQL } = req.body;

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    // -- Añadir DB a registros de APP ---
    const result = await pool.query(
        'INSERT INTO BaseDatos (Nombre,Descripcion,Resumen,ID_Usuario) VALUES ($1,$2,$3,$4) RETURNING ID',
        [dbName, Descripcion, Resumen, req.user.id]
    );
    const ResultadoIncert = result.rows[0];

    // --- Crear nueva DB ---
    const query = `CREATE DATABASE "ID_${ResultadoIncert.id}"`;
    try {
        await poolCreacion.query(query);
        console.log(`✅ Base de datos creada: "ID_${ResultadoIncert.id}"`);
    } catch (err) {
        console.error(`❌ Error creando la base de datos "ID_${ResultadoIncert.id}":`, err.message);
    }

    // --- Poblar SQL init ---



    res.json({ message: '', usuario: req.user });
});


router.get('/ObtenerDBs', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});


router.get('/ObtenerDB/:id', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});


router.put('/EditarDB', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});


router.delete('/BorrarDB', authMiddleware, Verifica("usuario"), (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    res.json({ message: 'Acceso permitido a la ruta protegida', usuario: req.user });
});



module.exports = router;