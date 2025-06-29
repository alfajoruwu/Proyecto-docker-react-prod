const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const pool = require('../../config/DB');
const NewPool = require('../../config/DB_lectura.js');

JWT_SECRET = process.env.JWT_SECRET

const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');

// Validación SQL para ejercicios (solo SELECT)
function validarSelectSQL(sql) {
    if (!sql || typeof sql !== 'string') {
        return { isValid: false, error: 'La consulta SQL proporcionada no es válida.' };
    }

    // Eliminar comentarios y normalizar espacios
    let limpio = sql
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Verificar que comience con SELECT
    if (!limpio.toUpperCase().startsWith('SELECT')) {
        return { isValid: false, error: 'Solo se permiten consultas SELECT' };
    }

    // Expresiones prohibidas
    const expresionesProhibidas = [
        /\bINSERT\b/i, /\bUPDATE\b/i, /\bDELETE\b/i, /\bDROP\b/i,
        /\bALTER\b/i, /\bCREATE\b/i, /\bTRUNCATE\b/i, /\bEXEC\b/i,
        /\bEXECUTE\b/i, /\bSET\b/i, /\bINTO\b/i, /\bCOPY\b/i,
        /\bGRANT\b/i, /\bREVOKE\b/i, /pg_(read|write)_/i, /pg_sleep/i
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

router.post('/CrearEjercicio', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { nombre, problema, descripcion, solucionSQL, dbId, permitirIA, verRespuestaEsperada, topicos, dificultad } = req.body;
    console.log("Datos recibidos para crear ejercicio:", req.body);
    if (!nombre || !problema || !descripcion || !solucionSQL || !dbId || dificultad === undefined) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Creando ejercicio para DB:", dbId);

    try {
        // Verificar que la DB pertenezca al usuario
        const dbCheck = await pool.query(
            'SELECT ID FROM BaseDatos WHERE ID = $1 AND ID_Usuario = $2',
            [dbId, req.user.id]
        );

        if (dbCheck.rows.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a esta base de datos' });
        }

        // Validar la consulta SQL de solución
        const validacion = validarSelectSQL(solucionSQL);
        if (!validacion.isValid) {
            return res.status(400).json({ error: validacion.error });
        }

        // Insertar el ejercicio
        const result = await pool.query(
            'INSERT INTO Ejercicios (Nombre_Ej, ID_Usuario, Problema, Descripcion, SQL_Solucion, ID_BaseDatos) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ID',
            [nombre, req.user.id, problema, descripcion || null, solucionSQL, dbId]
        );

        const nuevoEjercicio = result.rows[0];

        res.status(201).json({
            message: 'Ejercicio creado correctamente',
            ejercicioId: nuevoEjercicio.id
        });
    } catch (err) {
        console.error(`❌ Error creando ejercicio:`, err.message);
        return res.status(500).json({ error: 'Error al crear el ejercicio' });
    }
});


router.get('/ObtenerEjercicios', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { dbId } = req.query;

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    try {
        let query;
        let params;

        if (dbId) {
            // Filtrar por base de datos específica y verificar acceso
            const dbCheck = await pool.query(
                'SELECT ID FROM BaseDatos WHERE ID = $1 AND ID_Usuario = $2',
                [dbId, req.user.id]
            );

            if (dbCheck.rows.length === 0) {
                return res.status(403).json({ error: 'No tienes acceso a esta base de datos' });
            }

            query = `
                SELECT e.ID, e.Nombre_Ej, e.Problema, e.Descripcion, e.ID_BaseDatos, 
                       e.Fecha_Creacion, b.Nombre AS Nombre_BaseDatos
                FROM Ejercicios e
                JOIN BaseDatos b ON e.ID_BaseDatos = b.ID
                WHERE e.ID_BaseDatos = $1 AND e.ID_Usuario = $2
                ORDER BY e.Fecha_Creacion DESC
            `;
            params = [dbId, req.user.id];
        } else {
            // Obtener todos los ejercicios del usuario
            query = `
                SELECT e.ID, e.Nombre_Ej, e.Problema, e.Descripcion, e.ID_BaseDatos, 
                       e.Fecha_Creacion, b.Nombre AS Nombre_BaseDatos
                FROM Ejercicios e
                JOIN BaseDatos b ON e.ID_BaseDatos = b.ID
                WHERE e.ID_Usuario = $1
                ORDER BY e.Fecha_Creacion DESC
            `;
            params = [req.user.id];
        }

        const result = await pool.query(query, params);

        res.json({
            message: 'Ejercicios obtenidos correctamente',
            ejercicios: result.rows
        });
    } catch (err) {
        console.error(`❌ Error obteniendo ejercicios:`, err.message);
        return res.status(500).json({ error: 'Error al obtener los ejercicios' });
    }
});


router.get('/ObtenerEjercicio/:id', authMiddleware, Verifica("usuario"), async (req, res) => {
    const ejercicioId = req.params.id;

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Obteniendo ejercicio con ID:", ejercicioId);

    try {
        // Obtener el ejercicio con detalles de la base de datos
        const query = `
            SELECT e.ID, e.Nombre_Ej, e.Problema, e.Descripcion, e.SQL_Solucion, 
                   e.ID_BaseDatos, e.Fecha_Creacion, b.Nombre AS Nombre_BaseDatos
            FROM Ejercicios e
            JOIN BaseDatos b ON e.ID_BaseDatos = b.ID
            WHERE e.ID = $1 AND (e.ID_Usuario = $2 OR b.ID_Usuario = $2)
        `;

        const result = await pool.query(query, [ejercicioId, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ejercicio no encontrado o sin acceso' });
        }

        const ejercicio = result.rows[0];

        // Obtener estadísticas de intentos (opcional)
        const estadisticas = await pool.query(`
            SELECT 
                COUNT(*) AS total_intentos,
                SUM(CASE WHEN Es_Correcto = true THEN 1 ELSE 0 END) AS intentos_correctos
            FROM Intentos
            WHERE ID_Ejercicio = $1 AND ID_Usuario = $2
        `, [ejercicioId, req.user.id]);

        // Verificar si el usuario creó el ejercicio (para mostrar o no la solución)
        const esAutor = ejercicio.id_usuario === req.user.id;

        // Si no es autor, no enviar la solución
        if (!esAutor) {
            delete ejercicio.sql_solucion;
        }

        res.json({
            message: 'Ejercicio obtenido correctamente',
            ejercicio: ejercicio,
            estadisticas: estadisticas.rows[0],
            esAutor: esAutor
        });
    } catch (err) {
        console.error(`❌ Error obteniendo ejercicio:`, err.message);
        return res.status(500).json({ error: 'Error al obtener el ejercicio' });
    }
});


router.put('/editarEjercicio', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { ejercicioId, nombre, problema, descripcion, solucionSQL } = req.body;

    if (!ejercicioId) {
        return res.status(400).json({ error: 'ID de ejercicio no proporcionado' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Editando ejercicio con ID:", ejercicioId);

    try {
        // Verificar que el ejercicio pertenezca al usuario
        const ejercicioCheck = await pool.query(
            'SELECT ID FROM Ejercicios WHERE ID = $1 AND ID_Usuario = $2',
            [ejercicioId, req.user.id]
        );

        if (ejercicioCheck.rows.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este ejercicio' });
        }

        // Si hay solución SQL, validarla
        if (solucionSQL) {
            const validacion = validarSelectSQL(solucionSQL);
            if (!validacion.isValid) {
                return res.status(400).json({ error: validacion.error });
            }
        }

        // Construir actualización con COALESCE para campos opcionales
        const query = `
            UPDATE Ejercicios
            SET 
                Nombre_Ej = COALESCE($1, Nombre_Ej),
                Problema = COALESCE($2, Problema),
                Descripcion = COALESCE($3, Descripcion),
                SQL_Solucion = COALESCE($4, SQL_Solucion)
            WHERE ID = $5 AND ID_Usuario = $6
            RETURNING ID, Nombre_Ej, Problema, Descripcion, Fecha_Creacion
        `;

        const result = await pool.query(
            query,
            [
                nombre || null,
                problema || null,
                descripcion || null,
                solucionSQL || null,
                ejercicioId,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ejercicio no encontrado' });
        }

        res.json({
            message: 'Ejercicio actualizado correctamente',
            ejercicio: result.rows[0]
        });
    } catch (err) {
        console.error(`❌ Error actualizando ejercicio:`, err.message);
        return res.status(500).json({ error: 'Error al actualizar el ejercicio' });
    }
});


router.delete('/BorrarEjercicio/:id', authMiddleware, Verifica("usuario"), async (req, res) => {
    const ejercicioId = req.params.id;

    if (!ejercicioId) {
        return res.status(400).json({ error: 'ID de ejercicio no proporcionado' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Eliminando ejercicio con ID:", ejercicioId);

    try {
        // Verificar que el ejercicio pertenezca al usuario
        const ejercicioCheck = await pool.query(
            'SELECT ID FROM Ejercicios WHERE ID = $1 AND ID_Usuario = $2',
            [ejercicioId, req.user.id]
        );

        if (ejercicioCheck.rows.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este ejercicio' });
        }

        // Eliminar el ejercicio
        const result = await pool.query(
            'DELETE FROM Ejercicios WHERE ID = $1 AND ID_Usuario = $2 RETURNING ID',
            [ejercicioId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ejercicio no encontrado' });
        }

        res.json({
            message: 'Ejercicio eliminado correctamente',
            ejercicioId: result.rows[0].id
        });
    } catch (err) {
        console.error(`❌ Error eliminando ejercicio:`, err.message);
        return res.status(500).json({ error: 'Error al eliminar el ejercicio' });
    }
});


// Endpoint para evaluar la respuesta de un usuario a un ejercicio
router.post('/EvaluarRespuesta', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { ejercicioId, respuestaSQL } = req.body;

    if (!ejercicioId || !respuestaSQL) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Evaluando respuesta para ejercicio:", ejercicioId);

    try {
        // Verificar que el ejercicio exista
        const ejercicioQuery = await pool.query(
            'SELECT e.*, b.ID AS dbId FROM Ejercicios e JOIN BaseDatos b ON e.ID_BaseDatos = b.ID WHERE e.ID = $1',
            [ejercicioId]
        );

        if (ejercicioQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Ejercicio no encontrado' });
        }

        const ejercicio = ejercicioQuery.rows[0];
        const dbId = ejercicio.dbid;

        // Validar la consulta SQL de respuesta
        const validacion = validarSelectSQL(respuestaSQL);
        if (!validacion.isValid) {
            return res.status(400).json({ error: validacion.error });
        }

        // Conectar a la base de datos del ejercicio
        const dbPool = NewPool('ID_' + dbId);

        // Ejecutar la consulta de solución
        const resultadoSolucion = await dbPool.query(ejercicio.sql_solucion);

        // Ejecutar la consulta del usuario
        try {
            const resultadoRespuesta = await dbPool.query({
                text: respuestaSQL,
                timeout: 5000  // 5 segundos de timeout
            });

            // Comparar resultados
            let esCorrecta = false;

            if (resultadoSolucion.rows.length === resultadoRespuesta.rows.length) {
                // Comparamos los resultados
                esCorrecta = JSON.stringify(resultadoSolucion.rows) === JSON.stringify(resultadoRespuesta.rows);
            }

            // Convertir resultado a CSV
            let resultadoCSV = null;
            if (resultadoRespuesta.rows && resultadoRespuesta.rows.length > 0 && resultadoRespuesta.fields) {
                // Obtener los nombres de columnas
                const columnas = resultadoRespuesta.fields.map(f => f.name);
                const csvHeader = columnas.join('\t');

                // Convertir filas a formato tabular
                const csvRows = resultadoRespuesta.rows.map(row => {
                    return columnas.map(col => row[col] !== null ? String(row[col]) : '').join('\t');
                });

                // Unir todo en un string CSV
                resultadoCSV = [csvHeader, ...csvRows].join('\n');
            }

            // Registrar el intento
            await pool.query(
                'INSERT INTO Intentos (ID_Usuario, ID_Ejercicio, Tipo, SQL_Intento, Es_Correcto, Resultado_CSV) VALUES ($1, $2, $3, $4, $5, $6)',
                [req.user.id, ejercicioId, 'IntentoResolucion', respuestaSQL, esCorrecta, resultadoCSV]
            );

            res.json({
                message: esCorrecta ? '¡Correcto! Tu solución es válida.' : 'Solución incorrecta. Inténtalo de nuevo.',
                esCorrecta: esCorrecta,
                resultadoUsuario: resultadoRespuesta.rows,
                columnasUsuario: resultadoRespuesta.fields.map(f => f.name)
            });
        } catch (queryErr) {
            // Error al ejecutar la consulta del usuario
            await pool.query(
                'INSERT INTO Intentos (ID_Usuario, ID_Ejercicio, Tipo, SQL_Intento, Es_Correcto, Resultado_CSV) VALUES ($1, $2, $3, $4, $5, $6)',
                [req.user.id, ejercicioId, 'IntentoResolucion', respuestaSQL, false, 'ERROR: ' + queryErr.message]
            );

            return res.status(400).json({
                error: 'Error en tu consulta SQL',
                detalleError: queryErr.message,
                esCorrecta: false
            });
        }
    } catch (err) {
        console.error(`❌ Error evaluando respuesta:`, err.message);
        return res.status(500).json({ error: 'Error al evaluar la respuesta' });
    }
});

module.exports = router;