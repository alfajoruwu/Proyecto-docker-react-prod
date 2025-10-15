const express = require('express');
const router = express.Router();
const pool = require('../../config/DB');
const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');

// Toggle estrella (dar o quitar estrella a un ejercicio)
router.post('/toggle-estrella', authMiddleware, Verifica("usuario"), async (req, res) => {
    const { ejercicioId } = req.body;
    const userId = req.user.id;

    if (!ejercicioId) {
        return res.status(400).json({ error: 'Falta el ID del ejercicio' });
    }

    try {
        // Verificar si ya tiene estrella
        const existeEstrella = await pool.query(
            'SELECT ID FROM Estrellas WHERE ID_Usuario = $1 AND ID_Ejercicio = $2',
            [userId, ejercicioId]
        );

        if (existeEstrella.rows.length > 0) {
            // Si existe, quitar la estrella
            await pool.query(
                'DELETE FROM Estrellas WHERE ID_Usuario = $1 AND ID_Ejercicio = $2',
                [userId, ejercicioId]
            );
            
            // Contar estrellas actuales
            const conteoEstrellas = await pool.query(
                'SELECT COUNT(*) as total FROM Estrellas WHERE ID_Ejercicio = $1',
                [ejercicioId]
            );

            return res.json({
                message: 'Estrella removida',
                tieneEstrella: false,
                totalEstrellas: parseInt(conteoEstrellas.rows[0].total)
            });
        } else {
            // Si no existe, agregar la estrella
            await pool.query(
                'INSERT INTO Estrellas (ID_Usuario, ID_Ejercicio) VALUES ($1, $2)',
                [userId, ejercicioId]
            );

            // Contar estrellas actuales
            const conteoEstrellas = await pool.query(
                'SELECT COUNT(*) as total FROM Estrellas WHERE ID_Ejercicio = $1',
                [ejercicioId]
            );

            return res.json({
                message: 'Estrella agregada',
                tieneEstrella: true,
                totalEstrellas: parseInt(conteoEstrellas.rows[0].total)
            });
        }
    } catch (err) {
        console.error('❌ Error al manejar estrella:', err.message);
        return res.status(500).json({ error: 'Error al procesar la estrella' });
    }
});

// Obtener ejercicios con información de estrellas y completados para el usuario actual
router.get('/ejercicios-con-stats', authMiddleware, Verifica("usuario"), async (req, res) => {
    const userId = req.user.id;

    try {
        const ejercicios = await pool.query(
            `SELECT 
                e.ID,
                e.Nombre_Ej,
                e.Problema,
                e.Descripcion,
                e.Dificultad,
                e.Topicos,
                e.PermitirIA,
                e.PermitirSolucion,
                e.Fecha_Creacion,
                u.nombre as nombre_autor,
                b.Nombre as nombre_basedatos,
                b.Descripcion as contexto_db,
                -- Contar estrellas totales
                (SELECT COUNT(*) FROM Estrellas WHERE ID_Ejercicio = e.ID) as total_estrellas,
                -- Verificar si el usuario actual dio estrella
                EXISTS(SELECT 1 FROM Estrellas WHERE ID_Usuario = $1 AND ID_Ejercicio = e.ID) as tiene_estrella_usuario,
                -- Contar cuántas personas completaron el ejercicio
                (SELECT COUNT(DISTINCT ID_Usuario) 
                 FROM Intentos 
                 WHERE ID_Ejercicio = e.ID AND Es_Correcto = true AND Tipo = 'RevisarRespuesta') as veces_completado,
                -- Verificar si el usuario actual completó el ejercicio
                EXISTS(
                    SELECT 1 FROM Intentos 
                    WHERE ID_Usuario = $1 
                        AND ID_Ejercicio = e.ID 
                        AND Es_Correcto = true 
                        AND Tipo = 'RevisarRespuesta'
                ) as completado_por_usuario
            FROM Ejercicios e
            LEFT JOIN Usuarios u ON e.ID_Usuario = u.ID
            LEFT JOIN BaseDatos b ON e.ID_BaseDatos = b.ID
            ORDER BY e.Fecha_Creacion DESC`,
            [userId]
        );

        res.json({
            ejercicios: ejercicios.rows.map(ej => ({
                id: ej.id,
                nombre_ej: ej.nombre_ej,
                problema: ej.problema,
                descripcion: ej.descripcion,
                dificultad: ej.dificultad,
                topicos: ej.topicos || [],
                permitiria: ej.permitiria,
                permitirsolucion: ej.permitirsolucion,
                fecha_creacion: ej.fecha_creacion,
                nombre_autor: ej.nombre_autor,
                nombre_basedatos: ej.nombre_basedatos,
                contexto_db: ej.contexto_db,
                estrellas: parseInt(ej.total_estrellas) || 0,
                tiene_estrella: ej.tiene_estrella_usuario || false,
                veces_completado: parseInt(ej.veces_completado) || 0,
                completado: ej.completado_por_usuario || false
            }))
        });

    } catch (err) {
        console.error('❌ Error obteniendo ejercicios con stats:', err.message);
        return res.status(500).json({ error: 'Error al obtener ejercicios' });
    }
});

module.exports = router;
