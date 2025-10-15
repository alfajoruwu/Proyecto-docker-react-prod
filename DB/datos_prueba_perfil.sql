-- Script para crear datos de prueba para el perfil de usuario
-- Este script crea actividad simulada para un usuario existente

-- IMPORTANTE: Cambiar el ID del usuario y del ejercicio según tu base de datos
-- Para encontrar tu ID de usuario: SELECT id, nombre FROM Usuarios;

DO $$
DECLARE
    v_usuario_id INT := 1; -- CAMBIAR ESTE ID por el ID de tu usuario
    v_ejercicio_id INT;
    v_fecha TIMESTAMP;
    i INT;
BEGIN
    RAISE NOTICE 'Creando datos de prueba para usuario ID: %', v_usuario_id;
    
    -- Verificar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE ID = v_usuario_id) THEN
        RAISE EXCEPTION 'El usuario con ID % no existe. Cambia v_usuario_id en el script.', v_usuario_id;
    END IF;
    
    -- Crear algunos ejercicios de prueba si no existen
    FOR i IN 1..10 LOOP
        IF NOT EXISTS (SELECT 1 FROM Ejercicios WHERE ID = i) THEN
            -- Si no hay base de datos, crear una
            IF NOT EXISTS (SELECT 1 FROM BaseDatos LIMIT 1) THEN
                INSERT INTO BaseDatos (Nombre, ID_DB, SQL_init, Descripcion, Resumen, ID_Usuario)
                VALUES (
                    'Base de Prueba',
                    'db_test_' || i,
                    'CREATE TABLE usuarios (id INT PRIMARY KEY, nombre VARCHAR(100));',
                    'Base de datos de prueba',
                    'Datos de ejemplo',
                    v_usuario_id
                );
            END IF;
            
            INSERT INTO Ejercicios (
                Nombre_Ej,
                ID_Usuario,
                Problema,
                Descripcion,
                SQL_Solucion,
                Tabla_Solucion,
                ID_BaseDatos,
                PermitirIA,
                PermitirSolucion,
                Topicos,
                Dificultad
            )
            VALUES (
                'Ejercicio de Prueba ' || i,
                v_usuario_id,
                'Seleccionar todos los usuarios con ID mayor a 5',
                'Ejercicio de práctica con SELECT',
                'SELECT * FROM usuarios WHERE id > 5;',
                '[]',
                (SELECT ID FROM BaseDatos LIMIT 1),
                true,
                true,
                ARRAY['SELECT', 'WHERE', 'Filtros'],
                ((i % 3) + 1) -- Dificultad de 1 a 3 (Fácil, Medio, Difícil)
            );
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Ejercicios verificados/creados';
    
    -- Crear inicios de ejercicios (últimos 30 días)
    FOR i IN 1..15 LOOP
        v_ejercicio_id := ((i % 10) + 1);
        v_fecha := NOW() - (random() * INTERVAL '30 days');
        
        INSERT INTO IniciosEjercicio (ID_Usuario, ID_Ejercicio, Fecha_Hora)
        VALUES (v_usuario_id, v_ejercicio_id, v_fecha)
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Inicios de ejercicios creados: 15';
    
    -- Crear intentos de resolución
    FOR i IN 1..50 LOOP
        v_ejercicio_id := ((i % 10) + 1);
        v_fecha := NOW() - (random() * INTERVAL '30 days');
        
        INSERT INTO Intentos (
            ID_Usuario,
            ID_Ejercicio,
            Tipo,
            SQL_Intento,
            Es_Correcto,
            Fecha_Hora,
            Tabla_Solucion
        )
        VALUES (
            v_usuario_id,
            v_ejercicio_id,
            CASE WHEN i % 3 = 0 THEN 'RevisarRespuesta' ELSE 'IntentoResolucion' END,
            'SELECT * FROM usuarios WHERE id > ' || (i % 10) || ';',
            (random() > 0.4), -- 60% de éxito
            v_fecha,
            '[]'
        );
    END LOOP;
    
    RAISE NOTICE 'Intentos creados: 50';
    
    -- Crear consultas a la IA (solo PromptA - revisiones)
    FOR i IN 1..20 LOOP
        v_ejercicio_id := ((i % 10) + 1);
        v_fecha := NOW() - (random() * INTERVAL '20 days');
        
        INSERT INTO AyudaIA (
            ID_Usuario,
            ID_Ejercicio,
            Pregunta,
            Respuesta_IA,
            Tipo_Interaccion,
            Modelo,
            Fecha_Hora
        )
        VALUES (
            v_usuario_id,
            v_ejercicio_id,
            '{"problema": "Ayuda con SELECT", "contexto": "Base de datos de usuarios"}',
            'Para seleccionar datos usa SELECT * FROM tabla WHERE condicion;',
            'PromptA',
            'meta-llama/llama-4-maverick:free',
            v_fecha
        );
    END LOOP;
    
    RAISE NOTICE 'Consultas IA creadas: 20';
    
    -- Crear ejecuciones SQL
    FOR i IN 1..30 LOOP
        v_ejercicio_id := ((i % 10) + 1);
        v_fecha := NOW() - (random() * INTERVAL '25 days');
        
        INSERT INTO EjecucionesSQL (
            ID_Usuario,
            ID_Ejercicio,
            SQL_Ejecucion,
            Resultado,
            Fecha_Hora
        )
        VALUES (
            v_usuario_id,
            v_ejercicio_id,
            'SELECT * FROM usuarios WHERE id > ' || (i % 10) || ';',
            'id	nombre
1	Juan
2	María',
            v_fecha
        );
    END LOOP;
    
    RAISE NOTICE 'Ejecuciones SQL creadas: 30';
    
    -- Crear algunas estrellas
    FOR i IN 1..5 LOOP
        v_ejercicio_id := ((i % 10) + 1);
        
        INSERT INTO Estrellas (ID_Usuario, ID_Ejercicio)
        VALUES (v_usuario_id, v_ejercicio_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Estrellas creadas: 5';
    
    RAISE NOTICE '✅ Datos de prueba creados exitosamente!';
    RAISE NOTICE 'Ahora puedes ir a /mi-perfil para ver las estadísticas.';
END $$;

-- Verificar los datos creados
SELECT 
    'Inicios de ejercicios' as tipo,
    COUNT(*) as cantidad
FROM IniciosEjercicio
WHERE ID_Usuario = 1 -- Cambiar por tu ID de usuario

UNION ALL

SELECT 
    'Intentos totales',
    COUNT(*)
FROM Intentos
WHERE ID_Usuario = 1 -- Cambiar por tu ID de usuario

UNION ALL

SELECT 
    'Consultas IA',
    COUNT(*)
FROM AyudaIA
WHERE ID_Usuario = 1 -- Cambiar por tu ID de usuario

UNION ALL

SELECT 
    'Ejecuciones SQL',
    COUNT(*)
FROM EjecucionesSQL
WHERE ID_Usuario = 1 -- Cambiar por tu ID de usuario

UNION ALL

SELECT 
    'Estrellas',
    COUNT(*)
FROM Estrellas
WHERE ID_Usuario = 1; -- Cambiar por tu ID de usuario
