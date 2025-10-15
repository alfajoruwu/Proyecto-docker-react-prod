const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const pool = require('../../config/DB');
const NewPool = require('../../config/DB_lectura.js');
const NewPool_create = require('../../config/DB_Incert.js');
JWT_SECRET = process.env.JWT_SECRET


const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');

// --- Función para validar SQL (solo SELECT) ---
function validarSelectSQL(sql) {
    if (!sql || typeof sql !== 'string') {
        return { isValid: false, error: 'La consulta SQL proporcionada no es válida.' };
    }

    // 1. Eliminar comentarios y normalizar espacios
    let limpio = sql
        .replace(/--.*$/gm, '')                         // Comentarios línea
        .replace(/\/\*[\s\S]*?\*\//g, '')               // Comentarios multilinea
        .replace(/\s+/g, ' ')                           // Reemplazar múltiples espacios por uno
        .trim();                                        // Eliminar espacios extremos



    // 3. Verificar expresiones prohibidas
    const expresionesProhibidas = [
        /\bINSERT\b/i,
        /\bUPDATE\b/i,
        /\bDROP\b/i,
        /\bALTER\b/i,
        /\bCREATE\b/i,
        /\bTRUNCATE\b/i,
        /\bEXEC\b/i,
        /\bEXECUTE\b/i,
        /\bSET\b/i,
        /\bINTO\b/i,     // Previene SELECT INTO
        /\bCOPY\b/i,
        /\bGRANT\b/i,
        /\bREVOKE\b/i,
        /\bDOLL\s*\$\s*\$/i, // Bloquea funciones con $$ 
        /pg_(read|write)_/i,  // Acceso a sistema de archivos
        /pg_sleep/i,    // Funciones que pueden causar DoS
    ];

    for (const prohibida of expresionesProhibidas) {
        if (prohibida.test(limpio)) {
            return {
                isValid: false,
                error: `Uso de estructura prohibida: "${prohibida.toString()}"`
            };
        }
    }


    return { isValid: true };
}

router.post('/EjecutarQuery', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { dbId, query } = req.body;

    if (!dbId || !query) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Ejecutando query en DB:", dbId);

    try {

        // Validar que la consulta sea solo SELECT
        const validacion = validarSelectSQL(query);
        if (!validacion.isValid) {
            console.error('❌ Query rechazado:', validacion.error);
            return res.status(400).json({ error: validacion.error });
        }

        // Usar el pool de solo lectura para mayor seguridad
        const temp = NewPool_create('ID_' + dbId);

        // Establecer timeout para evitar consultas que consuman demasiados recursos
        const queryConfig = {
            text: query,
            timeout: 15000  // 15 segundos de timeout
        };

        // Ejecutar la consulta
        const startTime = Date.now();
        const result = await temp.query(queryConfig);
        const executionTime = Date.now() - startTime;

        // Información sobre las columnas para el frontend
        const columnas = result.fields ?
            result.fields.map(field => ({
                nombre: field.name,
                tipo: field.dataTypeID
            })) : [];

        res.json({
            message: 'Consulta ejecutada correctamente',
            columnas: columnas,
            filas: result.rows,
            tiempo: `${executionTime} ms`,
            registros: result.rowCount
        });
    } catch (err) {
        console.error(`❌ Error ejecutando la consulta:`, err.message);
        return res.status(500).json({
            error: 'Error ejecutando la consulta',
            detalle: err.message
        });
    }
});

router.post('/GuardarQuery', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { dbId, nombre, descripcion, query } = req.body;

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    // Lógica para guardar la consulta en la base de datos
    // Implementar cuando tengas la tabla para almacenar consultas guardadas

    res.json({ message: 'Consulta guardada correctamente' });
});





module.exports = router;