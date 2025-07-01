const express = require('express');
const router = express.Router();
const pool = require('../../config/DB');
const NewPool = require('../../config/DB_lectura.js');
const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');

// Registrar intento de resolución de un ejercicio
router.post('/RealizarIntento', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { ejercicioId, sqlIntento, esCorrecto, resultado } = req.body;

    if (!ejercicioId || !sqlIntento) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    try {
        // Convertir resultado a CSV si existe
        let resultadoCSV = null;
        if (resultado && resultado.columnas && resultado.filas) {
            // Obtener los nombres de columnas
            const columnas = resultado.columnas;
            const csvHeader = columnas.join('\t');

            // Convertir filas a formato tabular
            const csvRows = resultado.filas.map(row => {
                return columnas.map(col => row[col] !== null ? String(row[col]) : '').join('\t');
            });

            // Unir todo en un string CSV
            resultadoCSV = [csvHeader, ...csvRows].join('\n');
        }

        const result = await pool.query(
            'INSERT INTO Intentos (ID_Usuario, ID_Ejercicio, Tipo, SQL_Intento, Es_Correcto, Resultado_CSV) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ID',
            [req.user.id, ejercicioId, 'IntentoResolucion', sqlIntento, esCorrecto || false, resultadoCSV]
        );

        res.json({
            message: 'Intento registrado correctamente',
            intentoId: result.rows[0].id,
            resultadoCSV: resultadoCSV
        });
    } catch (err) {
        console.error(`❌ Error registrando intento:`, err.message);
        return res.status(500).json({ error: 'Error al registrar el intento' });
    }
});


// Revisar respuesta de un ejercicio
router.post('/RevisarRespuesta', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { ejercicioId, sqlIntento, Tabla_Usuario } = req.body;
    if (!ejercicioId || !sqlIntento || !Tabla_Usuario) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);
    try {
        // Obtener la solución del ejercicio
        const ejercicioQuery = await pool.query(
            'SELECT tabla_solucion FROM Ejercicios WHERE ID = $1',
            [ejercicioId]
        );
        if (ejercicioQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Ejercicio no encontrado' });
        }

        const ejercicio = ejercicioQuery.rows[0];
        console.log(ejercicio)
        const solucionSQL = ejercicio.Solucion_SQL;
        const tablaSolucion = ejercicio.Tabla_Solucion;

        console.log("Tabla del usuario:", Tabla_Usuario);

        const arrayText = `[${ejercicioQuery.rows[0].tabla_solucion.slice(1, -1)}]`;
        const TablasString = JSON.parse(arrayText);
        const ResultadoTablasString = TablasString.map(s => JSON.parse(s));
        console.log("Resultado de las tablas:", ResultadoTablasString);


        // Comparar la Tabla_Solucion de solución con el intento del usuario
        const esCorrecto = JSON.stringify(ResultadoTablasString) === JSON.stringify(Tabla_Usuario);
        // Registrar el intento

        console.log("Respuesta" + esCorrecto)
        const result = await pool.query(
            'INSERT INTO Intentos (ID_Usuario, ID_Ejercicio, Tipo, SQL_Intento, Es_Correcto, Tabla_Solucion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ID',
            [req.user.id, ejercicioId, 'RevisarRespuesta', sqlIntento, esCorrecto, JSON.stringify(Tabla_Usuario)]
        );
        res.json({
            message: 'Respuesta revisada correctamente',
            intentoId: result.rows[0].id,
            esCorrecto: esCorrecto,
            solucionSQL: solucionSQL,
            tablaSolucion: tablaSolucion,
            tablaUsuario: Tabla_Usuario
        });

    } catch (err) {
        console.error(`❌ Error revisando respuesta:`, err.message);
        return res.status(500).json({ error: 'Error al revisar la respuesta' });
    }
});

// Registrar ejecución SQL 
router.post('/EjecucionSQL', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { dbId, sqlQuery, ejercicioId } = req.body;

    if (!dbId || !sqlQuery || !ejercicioId) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    try {
        // Ejecutar la consulta en la DB correspondiente
        let resultado = null;
        let error = null;

        try {
            const dbPool = NewPool('ID_' + dbId);
            const queryResult = await dbPool.query(sqlQuery);

            // Convertir el resultado a formato CSV
            if (queryResult.rows && queryResult.rows.length > 0 && queryResult.fields) {
                // Obtener los nombres de columnas
                const columnas = queryResult.fields.map(f => f.name);
                const csvHeader = columnas.join('\t');

                // Convertir filas a formato tabular
                const csvRows = queryResult.rows.map(row => {
                    return columnas.map(col => row[col] !== null ? String(row[col]) : '').join('\t');
                });

                // Unir todo en un string CSV
                resultado = [csvHeader, ...csvRows].join('\n');
            }

            // Datos para el frontend
            const columnas = queryResult.fields ? queryResult.fields.map(f => f.name) : [];

            // Guardar en la base de datos
            const result = await pool.query(
                'INSERT INTO EjecucionesSQL (ID_Usuario, ID_Ejercicio, SQL_Ejecucion, Resultado) VALUES ($1, $2, $3, $4) RETURNING ID',
                [req.user.id, ejercicioId, sqlQuery, resultado]
            );

            res.json({
                message: 'Ejecución SQL registrada correctamente',
                ejecucionId: result.rows[0].id,
                columnas: columnas,
                filas: queryResult.rows,
                resultadoCSV: resultado
            });
        } catch (queryErr) {
            console.error(`❌ Error en la consulta SQL:`, queryErr.message);

            // Guardar el error en la base de datos
            const result = await pool.query(
                'INSERT INTO EjecucionesSQL (ID_Usuario, ID_Ejercicio, SQL_Ejecucion, Resultado) VALUES ($1, $2, $3, $4) RETURNING ID',
                [req.user.id, ejercicioId, sqlQuery, 'ERROR: ' + queryErr.message]
            );

            return res.status(400).json({
                error: 'Error en tu consulta SQL',
                mensaje: queryErr.message,
                ejecucionId: result.rows[0].id
            });
        }
    } catch (err) {
        console.error(`❌ Error registrando ejecución SQL:`, err.message);
        return res.status(500).json({ error: 'Error al registrar la ejecución SQL' });
    }
});

// Registrar consulta a la IA
router.post('/ConsultaIA', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { pregunta, respuesta, ejercicioId, tipoInteraccion } = req.body;

    if (!pregunta || !respuesta) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    try {
        const result = await pool.query(
            'INSERT INTO AyudaIA (ID_Usuario, ID_Ejercicio, Pregunta, Respuesta_IA, Tipo_Interaccion) VALUES ($1, $2, $3, $4, $5) RETURNING ID',
            [req.user.id, ejercicioId, pregunta, respuesta, tipoInteraccion]
        );

        res.json({
            message: 'Consulta IA registrada',
            consultaId: result.rows[0].id
        });
    } catch (err) {
        console.error(`❌ Error registrando consulta IA:`, err.message);
        return res.status(500).json({ error: 'Error al registrar la consulta IA' });
    }
});

// Obtener estadísticas de uso para el usuario
router.get('/EstadisticasUsuario', authMiddleware, Verifica("usuario"), async (req, res) => {
    console.log("Usuario autenticado:", req.user.id);
    console.log("Rol del usuario:", req.user.rol);

    try {
        const statsQuery = await pool.query(`
            SELECT COUNT(*) AS total_intentos FROM Intentos WHERE ID_Usuario = $1
        `, [req.user.id]);

        res.json({
            message: 'Estadísticas obtenidas',
            total_intentos: statsQuery.rows[0].total_intentos
        });
    } catch (err) {
        console.error(`❌ Error obteniendo estadísticas:`, err.message);
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Registrar inicio de un ejercicio
router.post('/IniciarEjercicio', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { ejercicioId } = req.body;
    if (!ejercicioId) {
        return res.status(400).json({ error: 'Falta el ID del ejercicio' });
    }

    try {
        await pool.query(
            'INSERT INTO IniciosEjercicio (ID_Usuario, ID_Ejercicio) VALUES ($1, $2)',
            [req.user.id, ejercicioId]
        );
        res.json({ message: 'Inicio de ejercicio registrado' });
    } catch (err) {
        console.error(`❌ Error registrando inicio de ejercicio:`, err.message);
        return res.status(500).json({ error: 'Error al registrar el inicio del ejercicio' });
    }
});

// Registrar ejecución de SQL (sin ejecutarla, solo log)
router.post('/RegistrarEjecucionSQL', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { ejercicioId, sqlQuery, resultado } = req.body;
    if (!ejercicioId || !sqlQuery) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        await pool.query(
            'INSERT INTO EjecucionesSQL (ID_Usuario, ID_Ejercicio, SQL_Ejecucion, Resultado) VALUES ($1, $2, $3, $4)',
            [req.user.id, ejercicioId, sqlQuery, resultado]
        );
        res.json({ message: 'Ejecución SQL registrada' });
    } catch (err) {
        console.error(`❌ Error registrando ejecución SQL:`, err.message);
        return res.status(500).json({ error: 'Error al registrar la ejecución SQL' });
    }
});


module.exports = router;