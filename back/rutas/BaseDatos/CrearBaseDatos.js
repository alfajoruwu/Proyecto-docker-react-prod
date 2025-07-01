const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const pool = require('../../config/DB');
const NewPool = require('../../config/DB_lectura.js');
const CrearConexionCreacion = require('../../config/DB_Creacion.js');
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

// Función para verificar conexiones activas a una base de datos
async function checkActiveConnections(dbName, adminPool) {
    try {
        // Consulta para obtener conexiones activas a la base de datos específica
        const connectionsQuery = `
            SELECT count(*) as active_connections
            FROM pg_stat_activity
            WHERE datname = $1 AND pid <> pg_backend_pid()
        `;

        const result = await adminPool.query(connectionsQuery, [dbName]);
        return parseInt(result.rows[0].active_connections);
    } catch (err) {
        console.error('Error al verificar conexiones activas:', err.message);
        throw err;
    }
}

// Función para terminar conexiones activas a una base de datos
async function terminateConnections(dbName, adminPool) {
    try {
        // Consulta para terminar conexiones activas
        const terminateQuery = `
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = $1 AND pid <> pg_backend_pid()
        `;

        await adminPool.query(terminateQuery, [dbName]);
        console.log(`✅ Conexiones a "${dbName}" terminadas correctamente`);
    } catch (err) {
        console.error(`❌ Error al terminar conexiones a "${dbName}":`, err.message);
        throw err;
    }
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


    // --- Crear conexion a la DB de creacion ---
    const poolCreacion = CrearConexionCreacion();

    // --- Crear nueva DB ---
    // NOTA: se le da acceso al usuario del incert
    const query = `CREATE DATABASE "ID_${ResultadoIncert.id}" OWNER "${process.env.CreacionTablas_user}"`;
    try {
        await poolCreacion.query(query);
        console.log(`✅ Base de datos creada: "ID_${ResultadoIncert.id}"`);
        await poolCreacion.end();

    } catch (err) {
        console.error(`❌ Error creando la base de datos "ID_${ResultadoIncert.id}":`, err.message);
        return res.status(400).json({ error: 'Error al crear la base de datos' });
    }

    // --- Poblar SQL init ---
    try {
        const temp = NewPool_create('ID_' + ResultadoIncert.id);
        const CreacionSQL = await temp.query(SQL);
        await temp.end();
    } catch (err) {
        console.error(`❌ Error "${err.message}":`, err.message);
        return res.status(400).json({ error: `Error SQL: ${err.message}` });
    }

    // --- Actualizar campo de SQLinit ---
    try {
        await pool.query(
            'UPDATE BaseDatos SET SQL_init = $1 WHERE ID = $2 AND ID_Usuario = $3',
            [SQL, ResultadoIncert.id, req.user.id]
        );
    } catch (err) {
        console.error(`❌ Error actualizando SQL_init:`, err.message);
        return res.status(500).json({ error: 'Error al actualizar SQL_init' });
    }

    res.json({ message: 'Base de datos creada', usuario: req.user });
});



router.get('/ObtenerDBsPublico', authMiddleware, Verifica("usuario"), async (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    const result = await pool.query('SELECT ID,Nombre,Descripcion,Resumen,Fecha_Creacion FROM BaseDatos');

    const ResultadoQuery = result.rows[0];

    res.json({ message: 'Tdoas las bases de datos', DB: result });
});


router.get('/ObtenerDBs', authMiddleware, Verifica("usuario"), async (req, res) => {

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    const result = await pool.query('SELECT ID,Nombre,Descripcion,Resumen,Fecha_Creacion FROM BaseDatos WHERE  ID_Usuario = $1', [req.user.id]);

    const ResultadoQuery = result.rows[0];

    res.json({ message: 'Tdoas las bases de datos', DB: result });
});


router.get('/ObtenerDB/:id', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { id: dbId } = req.params;

    if (!dbId) {
        return res.status(400).json({ error: 'ID de base de datos no proporcionado' });
    }

    console.log(`[INFO] Solicitud para obtener DB ID: ${dbId} por Usuario ID: ${req.user.id}`);

    try {
        // 1. Verificar que la DB pertenece al usuario autenticado
        const dbCheckResult = await pool.query(
            'SELECT ID, Nombre, Descripcion, Resumen, SQL_init, Fecha_Creacion FROM BaseDatos WHERE ID = $1 AND ID_Usuario = $2',
            [dbId, req.user.id]
        );

        if (dbCheckResult.rows.length === 0) {
            // Si no se encuentra, puede ser porque no existe o no le pertenece.
            // Por seguridad, damos un mensaje genérico de "no encontrado" para no revelar existencia.
            return res.status(404).json({ error: 'Base de datos no encontrada o no tienes acceso.' });
        }

        const dbData = dbCheckResult.rows[0];
        let tempPool = null;

        try {
            // 2. Conectar a la base de datos específica del usuario
            // Asumimos que NewPool crea y devuelve un pool de pg para la DB con nombre 'ID_...'
            tempPool = NewPool('ID_' + dbId);


            const tablasQuery = `
                SELECT tablename
                FROM pg_catalog.pg_tables
                WHERE schemaname = 'public';
                `;

            const estructuraResult = await tempPool.query(tablasQuery)



            res.json({
                message: 'Base de datos y estructura obtenidas correctamente',
                db: dbData,
                estructura: estructuraResult.rows
            });

        } catch (structureError) {
            console.error(`[ERROR] No se pudo obtener la estructura de la DB ID ${dbId}:`, structureError.message);
            // Si falla la obtención de la estructura, al menos devolvemos los datos básicos de la DB.
            res.status(500).json({
                message: 'Base de datos encontrada, pero ocurrió un error al obtener su estructura.',
                db: dbData,
                error: 'No se pudo leer la estructura de las tablas.'
            });
        } finally {
            // 4. MUY IMPORTANTE: Asegurarse de cerrar el pool de conexión temporal
            if (tempPool) {
                await tempPool.end();
                console.log(`[INFO] Pool temporal para DB ID ${dbId} cerrado.`);
            }
        }

    } catch (mainError) {
        console.error(`[FATAL] Error crítico obteniendo la base de datos ID ${dbId}:`, mainError.message);
        return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.' });
    }
});


router.put('/EditarDB', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { dbId, dbName, Descripcion, Resumen, SQL } = req.body;

    if (!dbId) {
        return res.status(400).json({ error: 'ID de base de datos no proporcionado' });
    }

    // Verificamos si se proporcionó al menos un campo para actualizar
    if (!dbName && !Descripcion && !Resumen && !SQL) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Editando DB con ID:", dbId);

    const forceTerminate = req.query.force === 'true'; // Parámetro opcional para forzar el cierre de conexiones
    const dbName_physical = `ID_${dbId}`;

    try {
        // Verificar que la DB pertenezca al usuario
        const dbCheck = await pool.query(
            'SELECT ID FROM BaseDatos WHERE ID = $1 AND ID_Usuario = $2',
            [dbId, req.user.id]
        );

        if (dbCheck.rows.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a esta base de datos' });
        }

        // Si hay un nuevo SQL, validarlo
        if (SQL) {
            const validacion = validarSQLVAR(SQL);
            if (!validacion.allValid) {
                return res.status(400).json({ error: `Error SQL: ${validacion.error}` });
            }
        }

        // Si solo hay cambios de metadatos (no de SQL), actualizamos normalmente
        if (!SQL) {
            // APPROACH 1: Using COALESCE (current implementation)
            const updateQuery = `
                UPDATE BaseDatos 
                SET 
                    Nombre = COALESCE($1, Nombre),
                    Descripcion = COALESCE($2, Descripcion),
                    Resumen = COALESCE($3, Resumen)
                WHERE ID = $4 AND ID_Usuario = $5
                RETURNING ID, Nombre, Descripcion, Resumen, Fecha_Creacion
            `;

            // This approach requires passing NULL for values that shouldn't change
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

            return res.json({
                message: 'Base de datos actualizada correctamente',
                DB: result.rows[0]
            });
        }

        // Si llegamos aquí, hay un nuevo SQL, debemos recrear la DB
        // Obtenemos metadatos existentes en caso de que no se haya proporcionado alguno nuevo
        const existingMetadata = await pool.query(
            'SELECT Nombre, Descripcion, Resumen FROM BaseDatos WHERE ID = $1',
            [dbId]
        );

        if (existingMetadata.rows.length === 0) {
            return res.status(404).json({ error: 'Base de datos no encontrada' });
        }

        const metadata = existingMetadata.rows[0];
        const finalDbName = dbName || metadata.Nombre;
        const finalDescripcion = Descripcion || metadata.Descripcion;
        const finalResumen = Resumen || metadata.Resumen;

        // Crear conexión a la DB de creación
        const poolCreacion = CrearConexionCreacion();

        // Verificar conexiones activas antes de eliminar
        try {
            const activeConnections = await checkActiveConnections(dbName_physical, poolCreacion);

            if (activeConnections > 0) {
                console.log(`⚠️ La base de datos "${dbName_physical}" tiene ${activeConnections} conexiones activas`);

                if (forceTerminate) {
                    // Si se solicita terminar conexiones forzadamente
                    await terminateConnections(dbName_physical, poolCreacion);
                    console.log(`✅ Conexiones a "${dbName_physical}" terminadas forzadamente`);
                } else {
                    await poolCreacion.end();
                    return res.status(409).json({
                        error: `La base de datos tiene ${activeConnections} conexiones activas. Cierre las conexiones o use ?force=true para forzar el cierre.`,
                        activeConnections
                    });
                }
            }

            // Eliminar la base de datos física
            try {
                const dropQuery = `DROP DATABASE IF EXISTS "${dbName_physical}"`;
                await poolCreacion.query(dropQuery);
                console.log(`✅ Base de datos eliminada para recreación: "${dbName_physical}"`);
            } catch (err) {
                console.error(`❌ Error eliminando la base de datos "${dbName_physical}":`, err.message);
                await poolCreacion.end();
                return res.status(500).json({ error: 'Error al eliminar la base de datos para actualizarla' });
            }

            // Crear nueva DB con el mismo nombre
            const createQuery = `CREATE DATABASE "${dbName_physical}" OWNER "${process.env.CreacionTablas_user}"`;
            try {
                await poolCreacion.query(createQuery);
                console.log(`✅ Base de datos recreada: "${dbName_physical}"`);
            } catch (err) {
                console.error(`❌ Error recreando la base de datos "${dbName_physical}":`, err.message);
                await poolCreacion.end();
                return res.status(500).json({ error: 'Error al recrear la base de datos' });
            } finally {
                await poolCreacion.end();
            }

            // Poblar SQL init
            try {
                const temp = NewPool_create(dbName_physical);
                const CreacionSQL = await temp.query(SQL);
                await temp.end();
            } catch (err) {
                console.error(`❌ Error SQL "${err.message}":`, err.message);
                return res.status(400).json({ error: `Error SQL: ${err.message}` });
            }

            // Actualizar metadatos en la tabla BaseDatos y añadir SQL_init

            const updateResult = await pool.query(
                'UPDATE BaseDatos SET Nombre = $1, Descripcion = $2, Resumen = $3, SQL_init = $4 WHERE ID = $5 AND ID_Usuario = $6 RETURNING ID, Nombre, Descripcion, Resumen, SQL_init, Fecha_Creacion',
                [finalDbName, finalDescripcion, finalResumen, SQL, dbId, req.user.id]
            );

            res.json({
                message: 'Base de datos y SQL actualizados correctamente',
                DB: updateResult.rows[0]
            });
        } catch (err) {
            console.error(`❌ Error general actualizando la base de datos:`, err.message);
            return res.status(500).json({ error: 'Error al actualizar la base de datos' });
        }
    } catch (err) {
        console.error(`❌ Error general en la ruta EditarDB:`, err.message);
        return res.status(500).json({ error: 'Error al actualizar la base de datos' });
    }
});

router.get('/ObtenerDB_publico/:id', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { id: dbId } = req.params;

    if (!dbId) {
        return res.status(400).json({ error: 'ID de base de datos no proporcionado' });
    }

    console.log(`[INFO] Solicitud para obtener DB ID: ${dbId} por Usuario ID: ${req.user.id}`);

    try {
        // 1. Obtener la base de datos por ID (sin validar dueño)
        const dbCheckResult = await pool.query(
            `
            SELECT 
                b.ID, 
                b.Nombre, 
                b.Descripcion, 
                b.Resumen, 
                b.SQL_init, 
                b.Fecha_Creacion,
                u.nombre AS Nombre_Autor
            FROM BaseDatos b
            JOIN Usuarios u ON b.ID_Usuario = u.ID
            WHERE b.ID = $1`,
            [dbId]
        );

        if (dbCheckResult.rows.length === 0) {
            return res.status(404).json({ error: 'Base de datos no encontrada' });
        }

        const dbData = dbCheckResult.rows[0];
        let tempPool = null;

        try {
            // 2. Conectar a la base de datos específica del usuario
            tempPool = NewPool('ID_' + dbId);

            // 3. Obtener estructura de las tablas
            const tablasQuery = `
                SELECT tablename
                FROM pg_catalog.pg_tables
                WHERE schemaname = 'public';
            `;

            const estructuraResult = await tempPool.query(tablasQuery);

            res.json({
                message: 'Base de datos y estructura obtenidas correctamente',
                db: dbData,
                estructura: estructuraResult.rows
            });

        } catch (structureError) {
            console.error(`[ERROR] No se pudo obtener la estructura de la DB ID ${dbId}:`, structureError.message);
            // Si falla la estructura, devolver los datos básicos
            res.status(500).json({
                message: 'Base de datos encontrada, pero ocurrió un error al obtener su estructura.',
                db: dbData,
                error: 'No se pudo leer la estructura de las tablas.'
            });
        } finally {
            // 4. Cerrar el pool temporal si fue creado
            if (tempPool) {
                await tempPool.end();
                console.log(`[INFO] Pool temporal para DB ID ${dbId} cerrado.`);
            }
        }

    } catch (mainError) {
        console.error(`[FATAL] Error crítico obteniendo la base de datos ID ${dbId}:`, mainError.message);
        return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.' });
    }
});

router.delete('/BorrarDB/:id', authMiddleware, Verifica("usuario"), async (req, res) => {
    const dbId = req.params.id;
    const forceTerminate = req.query.force === 'true'; // Parámetro opcional para forzar el cierre de conexiones

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

        const dbName = `ID_${dbId}`;
        const poolCreacion = CrearConexionCreacion();

        // Verificar conexiones activas antes de eliminar
        try {
            const activeConnections = await checkActiveConnections(dbName, poolCreacion);

            if (activeConnections > 0) {
                console.log(`⚠️ La base de datos "${dbName}" tiene ${activeConnections} conexiones activas`);

                if (forceTerminate) {
                    // Si se solicita terminar conexiones forzadamente
                    await terminateConnections(dbName, poolCreacion);
                    console.log(`✅ Conexiones a "${dbName}" terminadas forzadamente`);
                } else {
                    await poolCreacion.end();
                    return res.status(409).json({
                        error: `La base de datos tiene ${activeConnections} conexiones activas. Cierre las conexiones o use ?force=true para forzar el cierre.`,
                        activeConnections
                    });
                }
            }

            // Eliminar la base de datos del registro
            const deleteResult = await pool.query(
                'DELETE FROM BaseDatos WHERE ID = $1 AND ID_Usuario = $2 RETURNING ID',
                [dbId, req.user.id]
            );

            if (deleteResult.rows.length === 0) {
                await poolCreacion.end();
                return res.status(404).json({ error: 'Base de datos no encontrada' });
            }

            // Eliminar la base de datos física
            try {
                const dropQuery = `DROP DATABASE IF EXISTS "${dbName}"`;
                await poolCreacion.query(dropQuery);
                console.log(`✅ Base de datos eliminada: "${dbName}"`);
            } catch (err) {
                console.error(`❌ Error eliminando la base de datos "${dbName}":`, err.message);
                // Incluso si hay error aquí, continuamos ya que el registro ya fue eliminado
            } finally {
                await poolCreacion.end();
            }

            res.json({
                message: 'Base de datos eliminada correctamente',
                dbId: deleteResult.rows[0].ID
            });
        } catch (err) {
            await poolCreacion.end();
            throw err;
        }
    } catch (err) {
        console.error(`❌ Error eliminando la base de datos:`, err.message);
        return res.status(500).json({ error: 'Error al eliminar la base de datos' });
    }
});



module.exports = router;