const express = require('express');
const router = express.Router();
const pool = require('../../config/DB');
const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');

// Obtener estadísticas completas del usuario
router.get('/estadisticas', authMiddleware, Verifica("usuario"), async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Información básica del usuario
        const usuarioInfo = await pool.query(
            `SELECT 
                nombre, 
                email, 
                rol, 
                Fecha_Registro,
                DATE_PART('day', NOW() - Fecha_Registro) as dias_registrado
            FROM Usuarios 
            WHERE ID = $1`,
            [userId]
        );

        if (usuarioInfo.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 2. Estadísticas de ejercicios resueltos
        const ejerciciosResueltos = await pool.query(
            `SELECT 
                COUNT(DISTINCT ID_Ejercicio) as total_resueltos,
                COUNT(DISTINCT CASE WHEN Es_Correcto = true THEN ID_Ejercicio END) as resueltos_correctos
            FROM Intentos
            WHERE ID_Usuario = $1 AND Tipo = 'RevisarRespuesta'`,
            [userId]
        );

        // 3. Total de intentos
        const intentosTotales = await pool.query(
            `SELECT 
                COUNT(*) as total_intentos,
                COUNT(CASE WHEN Es_Correcto = true THEN 1 END) as intentos_correctos,
                COUNT(CASE WHEN Es_Correcto = false THEN 1 END) as intentos_incorrectos
            FROM Intentos
            WHERE ID_Usuario = $1`,
            [userId]
        );

        // 4. Ejercicios por dificultad (solo 1-3)
        const ejerciciosPorDificultad = await pool.query(
            `SELECT 
                e.Dificultad,
                COUNT(DISTINCT i.ID_Ejercicio) as total_intentados,
                COUNT(DISTINCT CASE WHEN i.Es_Correcto = true THEN i.ID_Ejercicio END) as resueltos
            FROM Intentos i
            INNER JOIN Ejercicios e ON i.ID_Ejercicio = e.ID
            WHERE i.ID_Usuario = $1 
                AND i.Tipo = 'RevisarRespuesta'
                AND e.Dificultad IN (1, 2, 3)
            GROUP BY e.Dificultad
            ORDER BY e.Dificultad`,
            [userId]
        );

        // 5. Uso de IA (solo PromptA - revisiones)
        const usoIA = await pool.query(
            `SELECT 
                COUNT(CASE WHEN Tipo_Interaccion = 'PromptA' THEN 1 END) as consultas_revision
            FROM AyudaIA
            WHERE ID_Usuario = $1`,
            [userId]
        );

        // 6. Actividad reciente (últimos 30 días)
        const actividadReciente = await pool.query(
            `SELECT 
                DATE(Fecha_Hora) as fecha,
                COUNT(*) as total_intentos
            FROM Intentos
            WHERE ID_Usuario = $1 
                AND Fecha_Hora >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(Fecha_Hora)
            ORDER BY fecha DESC`,
            [userId]
        );

        // 7. Ejercicios iniciados vs completados
        const iniciosVsCompletos = await pool.query(
            `SELECT 
                COUNT(DISTINCT ie.ID_Ejercicio) as total_iniciados,
                COUNT(DISTINCT i.ID_Ejercicio) as total_completados
            FROM IniciosEjercicio ie
            LEFT JOIN Intentos i ON ie.ID_Ejercicio = i.ID_Ejercicio 
                AND i.ID_Usuario = ie.ID_Usuario 
                AND i.Es_Correcto = true
            WHERE ie.ID_Usuario = $1`,
            [userId]
        );

        // 8. Tópicos más practicados
        const topicosPracticados = await pool.query(
            `SELECT 
                UNNEST(e.Topicos) as topico,
                COUNT(DISTINCT i.ID_Ejercicio) as ejercicios_intentados,
                COUNT(CASE WHEN i.Es_Correcto = true THEN 1 END) as ejercicios_resueltos
            FROM Intentos i
            INNER JOIN Ejercicios e ON i.ID_Ejercicio = e.ID
            WHERE i.ID_Usuario = $1 AND e.Topicos IS NOT NULL
            GROUP BY topico
            ORDER BY ejercicios_intentados DESC
            LIMIT 10`,
            [userId]
        );

        // 9. Ejecuciones SQL totales
        const ejecucionesSQL = await pool.query(
            `SELECT 
                COUNT(*) as total_ejecuciones
            FROM EjecucionesSQL
            WHERE ID_Usuario = $1`,
            [userId]
        );

        // 10. Racha de días consecutivos (últimos 7 días)
        const racha = await pool.query(
            `SELECT 
                COUNT(DISTINCT DATE(Fecha_Hora)) as dias_activos
            FROM Intentos
            WHERE ID_Usuario = $1 
                AND Fecha_Hora >= NOW() - INTERVAL '7 days'`,
            [userId]
        );

        // 11. Mejores ejercicios (resueltos en primer intento)
        const primerIntento = await pool.query(
            `WITH PrimerIntento AS (
                SELECT 
                    ID_Ejercicio,
                    MIN(Fecha_Hora) as primer_intento,
                    BOOL_OR(Es_Correcto) as resuelto_primero
                FROM Intentos
                WHERE ID_Usuario = $1 AND Tipo = 'RevisarRespuesta'
                GROUP BY ID_Ejercicio
            )
            SELECT 
                COUNT(*) as resueltos_primer_intento
            FROM PrimerIntento
            WHERE resuelto_primero = true`,
            [userId]
        );

        // 12. Tiempo promedio entre inicio y resolución
        const tiempoPromedio = await pool.query(
            `WITH TiemposResolucion AS (
                SELECT 
                    ie.ID_Ejercicio,
                    ie.Fecha_Hora as inicio,
                    MIN(i.Fecha_Hora) as solucion,
                    EXTRACT(EPOCH FROM (MIN(i.Fecha_Hora) - ie.Fecha_Hora))/60 as minutos
                FROM IniciosEjercicio ie
                INNER JOIN Intentos i ON ie.ID_Ejercicio = i.ID_Ejercicio 
                    AND ie.ID_Usuario = i.ID_Usuario 
                    AND i.Es_Correcto = true
                WHERE ie.ID_Usuario = $1
                GROUP BY ie.ID_Ejercicio, ie.Fecha_Hora
            )
            SELECT 
                ROUND(AVG(minutos)::numeric, 2) as tiempo_promedio_minutos,
                COUNT(*) as ejercicios_con_tiempo
            FROM TiemposResolucion
            WHERE minutos > 0 AND minutos < 1440`,
            [userId]
        );

        // 13. Estrellas dadas
        const estrellas = await pool.query(
            `SELECT 
                COUNT(*) as total_estrellas
            FROM Estrellas
            WHERE ID_Usuario = $1`,
            [userId]
        );

        // Construir respuesta
        const estadisticas = {
            usuario: usuarioInfo.rows[0],
            resumen: {
                ejercicios_resueltos: parseInt(ejerciciosResueltos.rows[0].resueltos_correctos) || 0,
                total_intentos: parseInt(intentosTotales.rows[0].total_intentos) || 0,
                intentos_correctos: parseInt(intentosTotales.rows[0].intentos_correctos) || 0,
                intentos_incorrectos: parseInt(intentosTotales.rows[0].intentos_incorrectos) || 0,
                consultas_ia: parseInt(usoIA.rows[0].consultas_revision) || 0,
                ejecuciones_sql: parseInt(ejecucionesSQL.rows[0].total_ejecuciones) || 0,
                estrellas_dadas: parseInt(estrellas.rows[0].total_estrellas) || 0,
                dias_activos_semana: parseInt(racha.rows[0].dias_activos) || 0,
                resueltos_primer_intento: parseInt(primerIntento.rows[0].resueltos_primer_intento) || 0
            },
            ejercicios: {
                total_resueltos: parseInt(ejerciciosResueltos.rows[0].total_resueltos) || 0,
                resueltos_correctos: parseInt(ejerciciosResueltos.rows[0].resueltos_correctos) || 0,
                iniciados: parseInt(iniciosVsCompletos.rows[0].total_iniciados) || 0,
                completados: parseInt(iniciosVsCompletos.rows[0].total_completados) || 0,
                por_dificultad: ejerciciosPorDificultad.rows.map(row => ({
                    dificultad: row.dificultad,
                    intentados: parseInt(row.total_intentados) || 0,
                    resueltos: parseInt(row.resueltos) || 0
                }))
            },
            ia: {
                consultas_revision: parseInt(usoIA.rows[0].consultas_revision) || 0
            },
            actividad: {
                ultimos_30_dias: actividadReciente.rows.map(row => ({
                    fecha: row.fecha,
                    intentos: parseInt(row.total_intentos) || 0
                })),
                tiempo_promedio_resolucion: parseFloat(tiempoPromedio.rows[0]?.tiempo_promedio_minutos) || 0,
                ejercicios_con_tiempo: parseInt(tiempoPromedio.rows[0]?.ejercicios_con_tiempo) || 0
            },
            topicos: topicosPracticados.rows.map(row => ({
                topico: row.topico,
                intentados: parseInt(row.ejercicios_intentados) || 0,
                resueltos: parseInt(row.ejercicios_resueltos) || 0
            })),
            tasa_exito: intentosTotales.rows[0].total_intentos > 0
                ? Math.round((intentosTotales.rows[0].intentos_correctos / intentosTotales.rows[0].total_intentos) * 100)
                : 0
        };

        res.json(estadisticas);

    } catch (err) {
        console.error('❌ Error obteniendo estadísticas del usuario:', err.message);
        res.status(500).json({ error: 'Error al obtener estadísticas del usuario' });
    }
});

// Obtener historial de intentos recientes
router.get('/historial-intentos', authMiddleware, Verifica("usuario"), async (req, res) => {
    const userId = req.user.id;
    const limite = parseInt(req.query.limite) || 10;

    try {
        const historial = await pool.query(
            `SELECT 
                i.ID,
                i.Fecha_Hora,
                i.SQL_Intento,
                i.Es_Correcto,
                e.Nombre_Ej,
                e.Dificultad
            FROM Intentos i
            INNER JOIN Ejercicios e ON i.ID_Ejercicio = e.ID
            WHERE i.ID_Usuario = $1
            ORDER BY i.Fecha_Hora DESC
            LIMIT $2`,
            [userId, limite]
        );

        res.json({
            historial: historial.rows
        });

    } catch (err) {
        console.error('❌ Error obteniendo historial:', err.message);
        res.status(500).json({ error: 'Error al obtener historial de intentos' });
    }
});

// Obtener logros del usuario
router.get('/logros', authMiddleware, Verifica("usuario"), async (req, res) => {
    const userId = req.user.id;

    try {
        const logros = [];

        // Logro: Primera sangre (primer ejercicio resuelto)
        const primerEjercicio = await pool.query(
            `SELECT MIN(Fecha_Hora) as fecha
            FROM Intentos
            WHERE ID_Usuario = $1 AND Es_Correcto = true`,
            [userId]
        );
        if (primerEjercicio.rows[0].fecha) {
            logros.push({
                nombre: "Primera Victoria",
                descripcion: "Resolviste tu primer ejercicio",
                icono: "🏆",
                fecha: primerEjercicio.rows[0].fecha,
                desbloqueado: true
            });
        }

        // Logro: Racha de 7 días
        const racha7 = await pool.query(
            `SELECT COUNT(DISTINCT DATE(Fecha_Hora)) as dias
            FROM Intentos
            WHERE ID_Usuario = $1 AND Fecha_Hora >= NOW() - INTERVAL '7 days'`,
            [userId]
        );
        logros.push({
            nombre: "Persistente",
            descripcion: "Activo 7 días en una semana",
            icono: "🔥",
            progreso: parseInt(racha7.rows[0].dias) || 0,
            objetivo: 7,
            desbloqueado: racha7.rows[0].dias >= 7
        });

        // Logro: 10 ejercicios resueltos
        const ejercicios10 = await pool.query(
            `SELECT COUNT(DISTINCT ID_Ejercicio) as total
            FROM Intentos
            WHERE ID_Usuario = $1 AND Es_Correcto = true`,
            [userId]
        );
        const totalResueltos = parseInt(ejercicios10.rows[0].total) || 0;
        logros.push({
            nombre: "Aprendiz",
            descripcion: "Resuelve 10 ejercicios",
            icono: "📚",
            progreso: totalResueltos,
            objetivo: 10,
            desbloqueado: totalResueltos >= 10
        });

        // Logro: Sin ayuda (5 ejercicios sin usar IA)
        const sinAyuda = await pool.query(
            `SELECT COUNT(DISTINCT i.ID_Ejercicio) as total
            FROM Intentos i
            WHERE i.ID_Usuario = $1 
                AND i.Es_Correcto = true
                AND NOT EXISTS (
                    SELECT 1 FROM AyudaIA a 
                    WHERE a.ID_Usuario = i.ID_Usuario 
                        AND a.ID_Ejercicio = i.ID_Ejercicio
                )`,
            [userId]
        );
        const sinAyudaTotal = parseInt(sinAyuda.rows[0].total) || 0;
        logros.push({
            nombre: "Autodidacta",
            descripcion: "Resuelve 5 ejercicios sin ayuda de IA",
            icono: "💪",
            progreso: sinAyudaTotal,
            objetivo: 5,
            desbloqueado: sinAyudaTotal >= 5
        });

        // Logro: Perfeccionista (resolver 3 en primer intento)
        const perfecto = await pool.query(
            `WITH PrimerIntento AS (
                SELECT 
                    ID_Ejercicio,
                    BOOL_AND(Es_Correcto) as perfecto,
                    COUNT(*) as intentos
                FROM Intentos
                WHERE ID_Usuario = $1 AND Tipo = 'RevisarRespuesta'
                GROUP BY ID_Ejercicio
                HAVING COUNT(*) = 1
            )
            SELECT COUNT(*) as total FROM PrimerIntento WHERE perfecto = true`,
            [userId]
        );
        const perfectoTotal = parseInt(perfecto.rows[0].total) || 0;
        logros.push({
            nombre: "Perfeccionista",
            descripcion: "Resuelve 3 ejercicios al primer intento",
            icono: "⭐",
            progreso: perfectoTotal,
            objetivo: 3,
            desbloqueado: perfectoTotal >= 3
        });

        res.json({
            logros: logros,
            total_logros: logros.length,
            logros_desbloqueados: logros.filter(l => l.desbloqueado).length
        });

    } catch (err) {
        console.error('❌ Error obteniendo logros:', err.message);
        res.status(500).json({ error: 'Error al obtener logros del usuario' });
    }
});

module.exports = router;
