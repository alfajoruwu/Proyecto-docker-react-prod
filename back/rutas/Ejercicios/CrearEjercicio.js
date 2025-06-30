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
    const { nombre, problema, descripcion, solucionSQL, dbId, permitirIA, verRespuestaEsperada, topicos, dificultad, Tabla_Solucion } = req.body;

    console.log("Datos recibidos para crear ejercicio:", req.body);

    // Todos los parametros son obligatorios
    if (!nombre || !problema || !descripcion || !solucionSQL || !dbId || permitirIA === undefined || verRespuestaEsperada === undefined || topicos === undefined || dificultad === undefined || dificultad === null) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
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
            `INSERT INTO Ejercicios (ID_Usuario, Nombre_Ej, Problema, Descripcion, SQL_Solucion, ID_BaseDatos, PermitirIA, PermitirSolucion, Topicos, Dificultad, Tabla_Solucion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING ID`,
            [
                req.user.id,
                nombre,
                problema,
                descripcion,
                solucionSQL,
                dbId,
                permitirIA,
                verRespuestaEsperada,
                topicos,
                dificultad,
                Tabla_Solucion,
            ]
        );

        const nuevoEjercicio = result.rows[0];

        res.status(201).json({
            message: 'Ejercicio creado correctamente',
            ejercicioId: nuevoEjercicio.id
        });
    } catch (err) {
        console.error(`❌ Error creando ejercicio:`, err.message);
        return res.status(500).json({ error: 'Error al crear el ejercicio', details: "Error creando ejercicio " + err.message });
    }
});

router.post('/DarEstrella', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { ejercicioId } = req.body;

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Dando estrella al ejercicio con ID:", ejercicioId);

    if (!ejercicioId) {
        return res.status(400).json({ error: 'ID de ejercicio no proporcionado' });
    }

    try {
        // Verificar que el ejercicio exista
        const ejercicioCheck = await pool.query(
            'SELECT ID FROM Ejercicios WHERE ID = $1',
            [ejercicioId]
        );

        if (ejercicioCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Ejercicio no encontrado' });
        }

        // Verificar si el usuario ya dio una estrella
        const estrellaCheck = await pool.query(
            'SELECT ID FROM Estrellas WHERE ID_Ejercicio = $1 AND ID_Usuario = $2',
            [ejercicioId, req.user.id]
        );

        if (estrellaCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Ya has dado una estrella a este ejercicio' });
        }

        // Insertar la estrella
        await pool.query(
            'INSERT INTO Estrellas (ID_Ejercicio, ID_Usuario) VALUES ($1, $2)',
            [ejercicioId, req.user.id]
        );

        res.json({
            message: 'Estrella dada correctamente'
        });
    } catch (err) {
        console.error(`❌ Error dando estrella:`, err.message);
        return res.status(500).json({ error: 'Error al dar la estrella', details: err.message });
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
                       e.Fecha_Creacion, b.Descripcion AS Contexto_DB, b.Nombre AS Nombre_BaseDatos, e.permitiria, e.permitirsolucion, e.topicos
                FROM Ejercicios e
                JOIN BaseDatos b ON e.ID_BaseDatos = b.ID
                WHERE e.ID_BaseDatos = $1 AND e.ID_Usuario = $2
                ORDER BY e.Fecha_Creacion DESC
            `;
            params = [dbId, req.user.id];
        } else {

            // Obtener todos los ejercicios del usuario
            // Junto a las estrellas del ejercicio
            // ademas de si el usuario actual le dio una estrella
            query = `
                SELECT 
                    e.ID,
                    e.Nombre_Ej,
                    e.Problema,
                    e.Descripcion,
                    e.ID_BaseDatos,
                    e.Dificultad,
                    e.Fecha_Creacion,
                    b.Descripcion AS Contexto_DB,
                    b.Nombre AS Nombre_BaseDatos,
                    e.PermitirIA,
                    e.PermitirSolucion,
                    e.Topicos,

                    -- Autor
                    u.nombre AS Nombre_Autor,

                    -- Total de estrellas que tiene el ejercicio
                    COUNT(DISTINCT es.ID) AS Total_Estrellas,

                    -- Si el usuario actual le dio estrella
                    CASE WHEN EXISTS (
                        SELECT 1 FROM Estrellas es2
                        WHERE es2.ID_Ejercicio = e.ID AND es2.ID_Usuario = $1
                    ) THEN TRUE ELSE FALSE END AS Usuario_Dio_Estrella

                FROM Ejercicios e

                JOIN BaseDatos b ON e.ID_BaseDatos = b.ID
                JOIN Usuarios u ON e.ID_Usuario = u.ID

                LEFT JOIN Estrellas es ON es.ID_Ejercicio = e.ID

                WHERE e.ID_Usuario = $1

                GROUP BY 
                    e.ID, e.Nombre_Ej, e.Problema, e.Descripcion, e.ID_BaseDatos, e.Dificultad,
                    e.Fecha_Creacion, b.Descripcion, b.Nombre, e.PermitirIA, e.PermitirSolucion, e.Topicos,
                    u.nombre
                ORDER BY e.Fecha_Creacion DESC;

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


router.get('/ObtenerEjercicio_Usuario/:id', authMiddleware, Verifica("usuario"), async (req, res) => {
    const ejercicioId = req.params.id;

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Obteniendo ejercicio con ID:", ejercicioId);

    try {
        // Obtener el ejercicio con detalles de la base de datos
        const query = `
            SELECT e.ID, e.Nombre_Ej, e.Problema, e.Descripcion, e.ID_BaseDatos,e.Dificultad, e.tabla_solucion,
                       e.Fecha_Creacion, b.Descripcion AS Contexto_DB, b.Nombre AS Nombre_BaseDatos, e.permitiria, e.permitirsolucion, e.topicos
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



        console.log("Tabla de solucion del ejercicio: ", ejercicio.tabla_solucion);

        const arrayText = `[${ejercicio.tabla_solucion.slice(1, -1)}]`;
        const TablasString = JSON.parse(arrayText);
        const ResultadoTablasString = TablasString.map(s => JSON.parse(s));
        console.log("Resultado de las tablas: ", ResultadoTablasString);
        res.json({
            message: 'Ejercicio obtenido correctamente',
            ejercicio: ejercicio,
            estadisticas: estadisticas.rows[0],
            Tablas: ResultadoTablasString,
        });
    } catch (err) {
        console.error(`❌ Error obteniendo ejercicio:`, err.message);
        return res.status(500).json({ error: 'Error al obtener el ejercicio', details: err.message });
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
            SELECT e.ID, e.Nombre_Ej, e.Problema, e.Descripcion, e.ID_BaseDatos,e.Dificultad, e.SQL_Solucion, e.tabla_solucion,
                       e.Fecha_Creacion, b.Descripcion AS Contexto_DB, b.Nombre AS Nombre_BaseDatos, e.permitiria, e.permitirsolucion, e.topicos
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



        console.log("Tabla de solucion del ejercicio: ", ejercicio.tabla_solucion);

        const arrayText = `[${ejercicio.tabla_solucion.slice(1, -1)}]`;
        const TablasString = JSON.parse(arrayText);
        const ResultadoTablasString = TablasString.map(s => JSON.parse(s));
        console.log("Resultado de las tablas: ", ResultadoTablasString);
        res.json({
            message: 'Ejercicio obtenido correctamente',
            ejercicio: ejercicio,
            estadisticas: estadisticas.rows[0],
            Tablas: ResultadoTablasString,
        });
    } catch (err) {
        console.error(`❌ Error obteniendo ejercicio:`, err.message);
        return res.status(500).json({ error: 'Error al obtener el ejercicio', details: err.message });
    }
});


router.put('/editarEjercicio', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { id, nombre, problema, descripcion, solucionSQL, dbId, permitirIA, verRespuestaEsperada, topicos, dificultad, Tabla_Solucion } = req.body;

    console.log("Datos recibidos para editar ejercicio:", req.body);

    // Todos los parametros son obligatorios
    if (!id || !nombre || !problema || !descripcion || !solucionSQL || !dbId || permitirIA === undefined || verRespuestaEsperada === undefined || topicos === undefined || dificultad === undefined || dificultad === null) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    console.log("Editando ejercicio con ID:", id);

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

        // Actualizar el ejercicio
        const result = await pool.query(
            `UPDATE Ejercicios 
                SET Nombre_Ej = $1, Problema = $2, Descripcion = $3, SQL_Solucion = $4, 
                    ID_BaseDatos = $5, PermitirIA = $6, PermitirSolucion = $7, Topicos = $8, Dificultad = $9, Tabla_Solucion = $10
                WHERE ID = $11 AND ID_Usuario = $12
                RETURNING ID`,
            [
                nombre,
                problema,
                descripcion,
                solucionSQL,
                dbId,
                permitirIA,
                verRespuestaEsperada,
                topicos,
                dificultad,
                Tabla_Solucion,
                id,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ejercicio no encontrado o sin acceso' });
        }
        res.json({
            message: 'Ejercicio editado correctamente',
            ejercicioId: result.rows[0].id
        });
    } catch (err) {
        console.error(`❌ Error editando ejercicio:`, err.message);
        return res.status(500).json({ error: 'Error al editar el ejercicio', details: err.message });
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