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


router.get('/ObtenerDBs', authMiddleware, Verifica("usuario"), async (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    const result = await pool.query('SELECT ID,Nombre,Descripcion,Resumen,Fecha_Creacion FROM BaseDatos WHERE  ID_Usuario = $1', [req.user.id]);

    const ResultadoQuery = result.rows[0];

    res.json({ message: 'Tdoas las bases de datos', DB: result });
});

router.get('/ObtenerDB/:id', authMiddleware, Verifica("usuario"), async (req, res) => {
    const dbId = req.params.id;

    if (!dbId) {
        return res.status(400).json({ error: 'ID de base de datos no proporcionado' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Obteniendo DB con ID:", dbId);

    try {
        // Verificar que la DB pertenezca al usuario
        const dbCheck = await pool.query(
            'SELECT ID FROM BaseDatos WHERE ID = $1 AND ID_Usuario = $2',
            [dbId, req.user.id]
        );

        if (dbCheck.rows.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a esta base de datos' });
        }

        // Obtener detalles de la DB
        const result = await pool.query(
            'SELECT ID, Nombre, Descripcion, Resumen, Fecha_Creacion FROM BaseDatos WHERE ID = $1',
            [dbId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Base de datos no encontrada' });
        }

        const dbData = result.rows[0];

        // Obtener estructura de tablas y sus datos
        try {
            const temp = NewPool('ID_' + dbId);

            // Obtener lista de tablas
            const tablasResult = await temp.query(`
                SELECT 
                    table_name 
                FROM 
                    information_schema.tables 
                WHERE 
                    table_schema = 'public'
            `);

            // Estructura para almacenar tablas, columnas y filas
            const estructura = [];

            // Para cada tabla, obtener sus datos y estructura
            for (const tabla of tablasResult.rows) {
                try {
                    // Hacer SELECT * para obtener datos y columnas
                    const datosResult = await temp.query(`SELECT * FROM "${tabla.table_name}"`);

                    // Obtener estructura de columnas a partir de los metadatos de la consulta
                    const columnas = datosResult.fields ?
                        datosResult.fields.map(field => ({
                            nombre: field.name,
                            tipo: field.dataTypeID
                        })) : [];

                    // Agregar tabla con su estructura y datos a la respuesta
                    estructura.push({
                        nombre: tabla.table_name,
                        columnas: columnas,
                        filas: datosResult.rows
                    });
                } catch (err) {
                    console.error(`Error obteniendo datos de la tabla ${tabla.table_name}:`, err.message);
                    estructura.push({
                        nombre: tabla.table_name,
                        error: `No se pudieron obtener datos: ${err.message}`
                    });
                }
            }

            res.json({
                message: 'Base de datos obtenida',
                DB: dbData,
                estructura: estructura
            });
        } catch (err) {
            console.error(`Error obteniendo estructura de la base de datos:`, err.message);
            // Si falla la obtención de estructura, al menos devolvemos los datos básicos
            res.json({ message: 'Base de datos obtenida (sin estructura)', DB: dbData });
        }
    } catch (err) {
        console.error(`❌ Error obteniendo la base de datos:`, err.message);
        return res.status(500).json({ error: 'Error al obtener la base de datos' });
    }
});


router.put('/EditarDB', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { dbId, dbName, Descripcion, Resumen } = req.body;

    if (!dbId) {
        return res.status(400).json({ error: 'ID de base de datos no proporcionado' });
    }

    if (!dbName && !Descripcion && !Resumen) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Editando DB con ID:", dbId);

    try {
        // Verificar que la DB pertenezca al usuario
        const dbCheck = await pool.query(
            'SELECT ID FROM BaseDatos WHERE ID = $1 AND ID_Usuario = $2',
            [dbId, req.user.id]
        );

        if (dbCheck.rows.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a esta base de datos' });
        }

        // Usamos COALESCE para actualizar solo los campos proporcionados
        // Si un campo no se proporciona, mantenemos el valor existente
        const updateQuery = `
            UPDATE BaseDatos 
            SET 
                Nombre = COALESCE($1, Nombre),
                Descripcion = COALESCE($2, Descripcion),
                Resumen = COALESCE($3, Resumen)
            WHERE ID = $4 AND ID_Usuario = $5
            RETURNING ID, Nombre, Descripcion, Resumen, Fecha_Creacion
        `;

        // Pasamos los valores o null si no existen
        const result = await pool.query(
            updateQuery,
            [
                dbName || null,
                Descripcion || null,
                Resumen || null,
                dbId,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Base de datos no encontrada' });
        }

        res.json({
            message: 'Base de datos actualizada correctamente',
            DB: result.rows[0]
        });
    } catch (err) {
        console.error(`❌ Error actualizando la base de datos:`, err.message);
        return res.status(500).json({ error: 'Error al actualizar la base de datos' });
    }
});


router.delete('/BorrarDB/:id', authMiddleware, Verifica("usuario"), async (req, res) => {
    const dbId = req.params.id;

    if (!dbId) {
        return res.status(400).json({ error: 'ID de base de datos no proporcionado' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Eliminando DB con ID:", dbId);

    try {
        // Verificar que la DB pertenezca al usuario
        const dbCheck = await pool.query(
            'SELECT ID FROM BaseDatos WHERE ID = $1 AND ID_Usuario = $2',
            [dbId, req.user.id]
        );

        if (dbCheck.rows.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a esta base de datos' });
        }

        // Eliminar la base de datos del registro
        const deleteResult = await pool.query(
            'DELETE FROM BaseDatos WHERE ID = $1 AND ID_Usuario = $2 RETURNING ID',
            [dbId, req.user.id]
        );

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Base de datos no encontrada' });
        }

        // Eliminar la base de datos física
        try {
            const dropQuery = `DROP DATABASE IF EXISTS "ID_${dbId}"`;
            await poolCreacion.query(dropQuery);
            console.log(`✅ Base de datos eliminada: "ID_${dbId}"`);
        } catch (err) {
            console.error(`❌ Error eliminando la base de datos "ID_${dbId}":`, err.message);
            // Incluso si hay error aquí, continuamos ya que el registro ya fue eliminado
        }

        res.json({
            message: 'Base de datos eliminada correctamente',
            dbId: deleteResult.rows[0].ID
        });
    } catch (err) {
        console.error(`❌ Error eliminando la base de datos:`, err.message);
        return res.status(500).json({ error: 'Error al eliminar la base de datos' });
    }
});



module.exports = router;