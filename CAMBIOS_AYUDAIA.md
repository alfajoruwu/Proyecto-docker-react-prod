# Cambios en el almacenamiento de datos de IA

## Resumen
Se ha modificado la tabla `AyudaIA` para guardar **todo el contexto del prompt** enviado a la IA, no solo la pregunta y respuesta básicas.

## Cambios realizados

### 1. Esquema de la base de datos (`DB/init.sql`)
Se agregaron las siguientes columnas a la tabla `AyudaIA`:

- **`Modelo`** (VARCHAR(200)): Nombre del modelo de IA utilizado
- **`Prompt_Completo`** (TEXT): El prompt completo enviado a la IA
- **`Contexto_BD`** (TEXT): El contexto de la base de datos
- **`Problema`** (TEXT): El enunciado del problema/ejercicio
- **`Respuesta_Estudiante`** (TEXT): La respuesta SQL del estudiante
- **`Respuesta_Correcta`** (TEXT): La solución SQL correcta (solo PromptA)
- **`Tabla_Esperada`** (TEXT): La tabla de resultados esperada (solo PromptA)
- **`Tabla_Estudiante`** (TEXT): La tabla generada por el estudiante (solo PromptA)

### 2. Endpoints modificados

#### PromptA (`/back/rutas/IA/IA.js`)
Ahora guarda:
- Modelo: `meta-llama/llama-4-maverick:free`
- Prompt completo
- Contexto de la BD
- Problema
- Respuesta del estudiante
- Respuesta correcta (SQL)
- Tabla esperada
- Tabla generada por el estudiante

#### PromptB (`/back/rutas/IA/IA.js`)
Ahora guarda:
- Modelo: `deepseek/deepseek-chat-v3-0324:free`
- Prompt completo
- Contexto de la BD
- Problema
- Respuesta del estudiante

#### ConsultaIA (`/back/rutas/Ejercicios/RegistrarInformacion.js`)
Ahora acepta opcionalmente todos los nuevos campos para que otros servicios puedan enviar información completa.

## Migración de base de datos existente

### Opción 1: Base de datos nueva
Si vas a crear la base de datos desde cero, simplemente ejecuta:
```bash
docker-compose down -v
docker-compose up -d
```

### Opción 2: Base de datos existente (sin perder datos)
Si tienes datos que deseas conservar, ejecuta el script de migración:

```bash
# Conectarse a la base de datos
docker exec -it <nombre-contenedor-postgres> psql -U <usuario> -d <nombre-db>

# Ejecutar el script de migración
\i /ruta/al/archivo/migracion_ayudaia.sql

# O desde fuera del contenedor:
docker exec -i <nombre-contenedor-postgres> psql -U <usuario> -d <nombre-db> < DB/migracion_ayudaia.sql
```

## Ventajas de los cambios

1. **Trazabilidad completa**: Ahora puedes reconstruir exactamente qué prompt se envió a la IA
2. **Análisis de modelos**: Puedes comparar qué modelo funciona mejor para cada tipo de consulta
3. **Debugging**: Si hay un problema con la respuesta de la IA, tienes todo el contexto
4. **Auditoría**: Registro completo de todas las interacciones con la IA
5. **Entrenamiento**: Los datos completos pueden usarse para entrenar o evaluar modelos propios
6. **Reproducibilidad**: Puedes reproducir exactamente la misma consulta

## Estructura de datos guardados

### Antes:
```json
{
  "Pregunta": "{\"contexto\":\"...\",\"problema\":\"...\",\"respuesta\":\"...\"}",
  "Respuesta_IA": "...",
  "Tipo_Interaccion": "PromptA"
}
```

### Después:
```json
{
  "Pregunta": "{\"contexto\":\"...\",\"problema\":\"...\",\"respuesta\":\"...\",\"tablaEstudiante\":\"...\"}",
  "Respuesta_IA": "...",
  "Tipo_Interaccion": "PromptA",
  "Modelo": "meta-llama/llama-4-maverick:free",
  "Prompt_Completo": "ROL>...<CONTEXTO>...",
  "Contexto_BD": "CREATE TABLE...",
  "Problema": "Listar todos los...",
  "Respuesta_Estudiante": "SELECT * FROM...",
  "Respuesta_Correcta": "SELECT id, nombre FROM...",
  "Tabla_Esperada": "[{...}]",
  "Tabla_Estudiante": "[{...}]"
}
```

## Notas importantes

- Los campos nuevos son **opcionales** para mantener compatibilidad con código existente
- El campo `Pregunta` sigue manteniendo el JSON con la estructura anterior por compatibilidad
- Los datos se guardan de forma redundante (en `Pregunta` y en los campos individuales) para facilitar consultas SQL y mantener compatibilidad
- No se pierde ninguna funcionalidad anterior
