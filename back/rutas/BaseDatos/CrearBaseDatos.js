const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const pool = require('../../config/DB');
const NewPool = require('../../config/DB_lectura.js');
const poolCreacion = require('../../config/DB_Creacion.js');
const NewPool_create = require('../../config/DB_Incert.js')
JWT_SECRET = process.env.JWT_SECRET


const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');

// --- Funciones AUX ---
function validarSQLVAR(sql) {
    if (!sql || typeof sql !== 'string') {
        return { allValid: false, error: 'El SQL proporcionado no es válido.' };
    }

    // 1. Eliminar comentarios: -- comentario y /* comentario */
    let limpio = sql
        .replace(/--.*$/gm, '')                         // Comentarios línea
        .replace(/\/\*[\s\S]*?\*\//g, '')               // Comentarios multilinea
        .replace(/\s+/g, ' ')                           // Reemplazar múltiples espacios por uno
        .trim();                                        // Eliminar espacios extremos

    // 2. Separar por sentencias SQL
    const sentencias = limpio
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    // 3. Permitir solo CREATE e INSERT
    const permitidas = ['CREATE', 'INSERT'];

    // 4. Prohibidas aunque estén dentro de CREATE
    const expresionesProhibidas = [
        /\bDROP\b/i,
        /\bDELETE\b/i,
        /\bUPDATE\b/i,
        /\bALTER\b/i,
        /\bGRANT\b/i,
        /\bTRUNCATE\b/i,
        /\bREPLACE\b/i,
        /\bEXECUTE\b/i,
        /\bMERGE\b/i,
        /\bFUNCTION\b/i,
        /\bTRIGGER\b/i,
        /\bINDEX\b/i,
        /\bSEQUENCE\b/i,
        /\bVIEW\b/i,
        /\bRULE\b/i,
        /\bCAST\b/i,
        /\bEXTENSION\b/i,
        /\bOWNER TO\b/i,
        /\bSECURITY\b/i
    ];

    for (const sentencia of sentencias) {
        const primeraPalabra = sentencia.split(/\s+/)[0].toUpperCase();

        if (!permitidas.includes(primeraPalabra)) {
            return {
                allValid: false,
                error: `Solo se permiten sentencias CREATE e INSERT. Detectado: "${primeraPalabra}"`
            };
        }

        for (const prohibida of expresionesProhibidas) {
            if (prohibida.test(sentencia)) {
                return {
                    allValid: false,
                    error: `Uso de estructura prohibida: "${prohibida.toString()}"`
                };
            }
        }
    }

    return { allValid: true };
}

router.post('/CrearDB', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { dbName, Descripcion, Resumen, SQL } = req.body;

    if (!dbName || !Descripcion || !Resumen || !SQL) {
        return res.status(400).json({ error: 'Falta completar datos en el formulario' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    // --- Validacion de SQL
    const validacion = validarSQLVAR(SQL);

    if (!validacion.allValid) {
        return res.status(400).json({ error: `Error SQL: ${validacion.error}` });
    }


    // -- Añadir DB a registros de APP ---
    const result = await pool.query(
        'INSERT INTO BaseDatos (Nombre,Descripcion,Resumen,ID_Usuario) VALUES ($1,$2,$3,$4) RETURNING ID',
        [dbName, Descripcion, Resumen, req.user.id]
    );
    const ResultadoIncert = result.rows[0];


    // --- Crear nueva DB ---
    // NOTA: se le da acceso al usuario del incert
    const query = `CREATE DATABASE "ID_${ResultadoIncert.id}" OWNER "${process.env.CreacionTablas_user}"`;
    try {
        await poolCreacion.query(query);
        console.log(`✅ Base de datos creada: "ID_${ResultadoIncert.id}"`);
    } catch (err) {
        console.error(`❌ Error creando la base de datos "ID_${ResultadoIncert.id}":`, err.message);
        return res.status(400).json({ error: 'Error al crear la base de datos' });
    }

    // --- Poblar SQL init ---
    try {
        const temp = NewPool_create('ID_' + ResultadoIncert.id);
        const CreacionSQL = await temp.query(SQL);
    } catch (err) {
        console.error(`❌ Error "${err.message}":`, err.message);
        return res.status(400).json({ error: `Error SQL: ${err.message}` });
    }

    res.json({ message: 'Base de datos creada', usuario: req.user });
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