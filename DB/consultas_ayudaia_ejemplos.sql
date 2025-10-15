-- Ejemplos de consultas para analizar los datos de IA guardados

-- 1. Ver todas las interacciones de IA con todos los detalles
SELECT 
    ID,
    ID_Usuario,
    ID_Ejercicio,
    Fecha_Hora,
    Tipo_Interaccion,
    Modelo,
    Contexto_BD,
    Problema,
    Respuesta_Estudiante,
    Respuesta_Correcta,
    Tabla_Esperada,
    Tabla_Estudiante,
    Respuesta_IA
FROM AyudaIA
ORDER BY Fecha_Hora DESC
LIMIT 10;

-- 2. Contar interacciones por modelo
SELECT 
    Modelo,
    COUNT(*) as total_consultas,
    COUNT(DISTINCT ID_Usuario) as usuarios_unicos
FROM AyudaIA
WHERE Modelo IS NOT NULL
GROUP BY Modelo
ORDER BY total_consultas DESC;

-- 3. Ver interacciones por tipo
SELECT 
    Tipo_Interaccion,
    COUNT(*) as total,
    AVG(LENGTH(Prompt_Completo)) as promedio_longitud_prompt,
    AVG(LENGTH(Respuesta_IA)) as promedio_longitud_respuesta
FROM AyudaIA
GROUP BY Tipo_Interaccion;

-- 4. Ver prompts completos de un ejercicio específico
SELECT 
    Fecha_Hora,
    Tipo_Interaccion,
    Modelo,
    Prompt_Completo,
    Respuesta_IA
FROM AyudaIA
WHERE ID_Ejercicio = 1  -- Cambiar por el ID del ejercicio
ORDER BY Fecha_Hora DESC;

-- 5. Ver diferencias entre respuesta correcta y respuesta del estudiante
SELECT 
    ID,
    Fecha_Hora,
    Problema,
    Respuesta_Estudiante,
    Respuesta_Correcta,
    CASE 
        WHEN Respuesta_Estudiante = Respuesta_Correcta THEN 'Igual'
        ELSE 'Diferente'
    END as comparacion
FROM AyudaIA
WHERE Respuesta_Correcta IS NOT NULL
ORDER BY Fecha_Hora DESC;

-- 6. Análisis de longitud de prompts por modelo
SELECT 
    Modelo,
    MIN(LENGTH(Prompt_Completo)) as prompt_min,
    AVG(LENGTH(Prompt_Completo)) as prompt_avg,
    MAX(LENGTH(Prompt_Completo)) as prompt_max
FROM AyudaIA
WHERE Modelo IS NOT NULL AND Prompt_Completo IS NOT NULL
GROUP BY Modelo;

-- 7. Ver todas las consultas de un usuario específico con contexto completo
SELECT 
    a.Fecha_Hora,
    a.Tipo_Interaccion,
    a.Modelo,
    e.Nombre_Ej as nombre_ejercicio,
    a.Problema,
    a.Respuesta_Estudiante,
    a.Respuesta_IA
FROM AyudaIA a
LEFT JOIN Ejercicios e ON a.ID_Ejercicio = e.ID
WHERE a.ID_Usuario = 1  -- Cambiar por el ID del usuario
ORDER BY a.Fecha_Hora DESC;

-- 8. Buscar consultas por contenido del problema
SELECT 
    ID,
    Fecha_Hora,
    Problema,
    Respuesta_IA
FROM AyudaIA
WHERE Problema LIKE '%SELECT%'  -- Cambiar por el término de búsqueda
ORDER BY Fecha_Hora DESC;

-- 9. Estadísticas de uso de IA por hora del día
SELECT 
    EXTRACT(HOUR FROM Fecha_Hora) as hora,
    COUNT(*) as total_consultas,
    AVG(LENGTH(Respuesta_IA)) as promedio_respuesta
FROM AyudaIA
GROUP BY hora
ORDER BY hora;

-- 10. Ver las consultas más recientes con formato completo
SELECT 
    to_char(Fecha_Hora, 'YYYY-MM-DD HH24:MI:SS') as fecha,
    Tipo_Interaccion,
    Modelo,
    substring(Problema, 1, 100) || '...' as problema_preview,
    substring(Respuesta_Estudiante, 1, 100) || '...' as respuesta_preview,
    substring(Respuesta_IA, 1, 200) || '...' as respuesta_ia_preview
FROM AyudaIA
ORDER BY Fecha_Hora DESC
LIMIT 20;

-- 11. Comparar rendimiento entre modelos (PromptA vs PromptB)
SELECT 
    Tipo_Interaccion,
    Modelo,
    COUNT(*) as total_usos,
    AVG(LENGTH(Respuesta_IA)) as longitud_promedio_respuesta,
    MIN(LENGTH(Respuesta_IA)) as respuesta_mas_corta,
    MAX(LENGTH(Respuesta_IA)) as respuesta_mas_larga
FROM AyudaIA
WHERE Modelo IS NOT NULL
GROUP BY Tipo_Interaccion, Modelo
ORDER BY Tipo_Interaccion, total_usos DESC;

-- 12. Exportar datos completos para análisis externo (CSV)
COPY (
    SELECT 
        ID,
        ID_Usuario,
        ID_Ejercicio,
        Fecha_Hora,
        Tipo_Interaccion,
        Modelo,
        Contexto_BD,
        Problema,
        Respuesta_Estudiante,
        Respuesta_Correcta,
        Tabla_Esperada,
        Tabla_Estudiante,
        Pregunta,
        Respuesta_IA
    FROM AyudaIA
    ORDER BY Fecha_Hora DESC
) TO '/tmp/ayudaia_export.csv' WITH CSV HEADER DELIMITER ',';
