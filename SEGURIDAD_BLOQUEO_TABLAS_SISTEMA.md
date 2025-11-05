# Seguridad: Bloqueo de Tablas del Sistema PostgreSQL

## Problema Identificado

Los usuarios podían ejecutar consultas como:
```sql
SELECT * FROM pg_tables;
SELECT * FROM pg_user;
SELECT * FROM information_schema.tables;
```

Esto exponía **información sensible del sistema** como:
- Nombres de todas las bases de datos
- Usuarios del sistema
- Estructuras de tablas del sistema
- Metadatos de configuración

## Riesgo de Seguridad

### 🔴 **ALTO RIESGO**

Permitir acceso a tablas del sistema puede revelar:
- **Usuarios y roles** del servidor PostgreSQL
- **Nombres de bases de datos** de otros usuarios
- **Estructura interna** del sistema
- **Información de configuración** sensible
- Posibles **vectores de ataque** para escalación de privilegios

## Solución Implementada

### Validación Mejorada en `validarSelectSQL()`

**Archivo:** `back/rutas/BaseDatos/UsarBaseDatos.js`

Se agregó una nueva sección de validación que bloquea:

#### 1. Tablas del Sistema PostgreSQL
```javascript
/\bpg_\w+/i  // Bloquea: pg_tables, pg_user, pg_database, pg_stat, etc.
```

**Bloqueadas:**
- `pg_tables` - Listado de tablas
- `pg_user` - Usuarios del sistema
- `pg_database` - Bases de datos
- `pg_stat_*` - Estadísticas
- `pg_shadow` - Contraseñas (hasheadas)
- Y cualquier otra tabla que comience con `pg_`

#### 2. Schemas del Sistema
```javascript
/\binformation_schema\./i  // Bloquea: information_schema.*
/\bpg_catalog\./i          // Bloquea: pg_catalog.*
```

**Bloqueados:**
- `information_schema.tables`
- `information_schema.columns`
- `pg_catalog.pg_tables`
- Y cualquier acceso a estos schemas

#### 3. Funciones de Metadatos
```javascript
/\bcurrent_user\b/i        // Bloquea: current_user
/\bcurrent_database\b/i    // Bloquea: current_database()
/\bsession_user\b/i        // Bloquea: session_user
/\buser\s*\(/i            // Bloquea: USER()
```

**Bloqueadas:**
- `SELECT current_user;`
- `SELECT current_database();`
- `SELECT session_user;`
- `SELECT USER();`

## Consultas Bloqueadas (Ejemplos)

### ❌ Ahora estas consultas fallarán:

```sql
-- Listar tablas del sistema
SELECT * FROM pg_tables;
SELECT * FROM pg_catalog.pg_tables;

-- Ver usuarios
SELECT * FROM pg_user;
SELECT * FROM pg_shadow;

-- Ver bases de datos
SELECT * FROM pg_database;

-- Metadatos
SELECT * FROM information_schema.tables;
SELECT * FROM information_schema.columns;

-- Funciones de información
SELECT current_user;
SELECT current_database();
SELECT session_user;
```

**Mensaje de error:**
```
No se permite acceso a tablas del sistema o metadatos de PostgreSQL
```

## Consultas Permitidas

### ✅ Estas consultas siguen funcionando:

```sql
-- Tablas del usuario en schema public
SELECT * FROM usuarios;
SELECT * FROM productos;
SELECT * FROM ventas;

-- Joins entre tablas del usuario
SELECT u.nombre, p.titulo 
FROM usuarios u 
JOIN publicaciones p ON u.id = p.usuario_id;

-- Funciones SQL estándar
SELECT COUNT(*), AVG(precio) FROM productos;
SELECT UPPER(nombre) FROM usuarios;

-- Consultas complejas
SELECT * FROM usuarios 
WHERE id IN (SELECT usuario_id FROM publicaciones);
```

## Cómo Probar la Seguridad

### 1. Reconstruir los contenedores
```bash
docker compose -f docker-compose.build.yml down
docker compose -f docker-compose.build.yml up --build -d
```

### 2. Intentar consultas prohibidas

En el ejecutor SQL del frontend, intenta:

```sql
SELECT * FROM pg_tables;
```

**Resultado esperado:**
```
❌ Error: No se permite acceso a tablas del sistema o metadatos de PostgreSQL
```

### 3. Verificar consultas normales funcionan

```sql
SELECT * FROM tu_tabla_de_ejercicio;
```

**Resultado esperado:**
```
✅ Devuelve los datos correctamente
```

## Capas de Seguridad Implementadas

### 🛡️ Capa 1: Validación de Sintaxis
- Bloquea: INSERT, UPDATE, DELETE, DROP, ALTER, CREATE
- Ubicación: `validarSelectSQL()` función

### 🛡️ Capa 2: Bloqueo de Tablas del Sistema
- Bloquea: pg_*, information_schema, pg_catalog
- Ubicación: `validarSelectSQL()` función (nueva)

### 🛡️ Capa 3: Permisos de Usuario PostgreSQL
- Usuario: `usuario_lectura123` (APP_DB_USER)
- Permisos: Solo SELECT en schema public
- Sin acceso: pg_catalog, information_schema

### 🛡️ Capa 4: Timeout
- Tiempo máximo: 15 segundos
- Previene: Consultas de denegación de servicio

### 🛡️ Capa 5: Aislamiento de Bases de Datos
- Cada ejercicio: Base de datos separada (ID_1, ID_2, etc.)
- Sin acceso: A bases de datos de otros usuarios
- Contenedor: postgres-usuarios (aislado del sistema principal)

## Testing de Seguridad

### Casos de Prueba

| # | Consulta | Resultado Esperado |
|---|----------|-------------------|
| 1 | `SELECT * FROM pg_tables;` | ❌ Bloqueado |
| 2 | `SELECT * FROM pg_user;` | ❌ Bloqueado |
| 3 | `SELECT * FROM information_schema.tables;` | ❌ Bloqueado |
| 4 | `SELECT current_user;` | ❌ Bloqueado |
| 5 | `SELECT * FROM usuarios;` | ✅ Permitido |
| 6 | `SELECT COUNT(*) FROM productos;` | ✅ Permitido |
| 7 | `DROP TABLE usuarios;` | ❌ Bloqueado |
| 8 | `INSERT INTO usuarios VALUES (1, 'test');` | ❌ Bloqueado |

## Limitaciones Conocidas

### ⚠️ Lo que NO se puede hacer (por diseño):

1. **Ver tablas de otros usuarios**: Cada usuario solo ve sus propias bases de datos de ejercicios
2. **Acceder a metadatos del sistema**: No se puede ver información de configuración
3. **Usar funciones administrativas**: pg_sleep, pg_read_file, etc. están bloqueadas
4. **Ver usuarios del sistema**: No se pueden listar otros usuarios de PostgreSQL

### ✅ Lo que SÍ se puede hacer:

1. **Ejecutar SELECT** en tablas del ejercicio
2. **Usar funciones SQL estándar**: COUNT, SUM, AVG, UPPER, LOWER, etc.
3. **Hacer JOINS** entre tablas del mismo ejercicio
4. **Subconsultas** complejas
5. **Agregaciones** y GROUP BY

## Recomendaciones Adicionales

### Para el Futuro:

1. **Rate Limiting**: Limitar cantidad de queries por minuto por usuario
2. **Logging de Consultas**: Guardar todas las consultas ejecutadas para auditoría
3. **Análisis de Patrones**: Detectar intentos repetidos de consultas prohibidas
4. **Alertas de Seguridad**: Notificar cuando se detectan patrones sospechosos
5. **Whitelist de Funciones**: Solo permitir funciones SQL específicas aprobadas

## Archivo Modificado

- ✅ `back/rutas/BaseDatos/UsarBaseDatos.js` - Función `validarSelectSQL()`

## Fecha de Implementación

15 de octubre de 2025

## Estado

🟢 **IMPLEMENTADO Y ACTIVO**

La validación está activa en todas las consultas ejecutadas desde el frontend.
