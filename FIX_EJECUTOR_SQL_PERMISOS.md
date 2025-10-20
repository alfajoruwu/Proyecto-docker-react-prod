# Fix: Problema de Acceso a Tablas en Ejecutor SQL

## Problema Identificado

No se podía acceder a las tablas de PostgreSQL desde el ejecutador de SQL. Los usuarios recibían errores de permisos al intentar ejecutar consultas SELECT.

## Causas Encontradas

### 1. **Pool incorrecto en EjecutarQuery**
En `back/rutas/BaseDatos/UsarBaseDatos.js` se estaba usando:
```javascript
const temp = NewPool_create('ID_' + dbId);  // ❌ Pool para escritura
```

Debería ser:
```javascript
const temp = NewPool('ID_' + dbId);  // ✅ Pool para lectura
```

### 2. **Puerto hardcodeado**
En `back/config/DB_lectura.js` el puerto estaba fijo:
```javascript
port: 5432,  // ❌ Hardcoded
```

Debería usar la variable de entorno:
```javascript
port: process.env.POSTGRES_PORT || 5432,  // ✅ Configurable
```

### 3. **Permisos no otorgados en bases dinámicas**
Cuando se crean bases de datos dinámicas (`ID_1`, `ID_2`, etc.), no se estaban otorgando permisos al usuario de lectura (`APP_DB_USER`).

### 4. **Script de inicialización incompleto**
El script `DB-Usuarios/init.sh` tenía permisos por defecto mal configurados y no funcionaban para bases de datos creadas dinámicamente.

## Soluciones Implementadas

### 1. ✅ Corregir pool en EjecutarQuery
**Archivo:** `back/rutas/BaseDatos/UsarBaseDatos.js`

Cambiado de `NewPool_create` a `NewPool` para usar el pool de solo lectura.

### 2. ✅ Usar variable de entorno para puerto
**Archivo:** `back/config/DB_lectura.js`

Ahora usa `process.env.POSTGRES_PORT` en lugar de hardcodear 5432.

### 3. ✅ Otorgar permisos automáticamente
**Archivo:** `back/rutas/BaseDatos/CrearBaseDatos.js`

Al crear una base de datos nueva:
```javascript
await tempPool.query(`GRANT CONNECT ON DATABASE "ID_${dbId}" TO ${process.env.APP_DB_USER}`);
await tempPool.query(`GRANT USAGE ON SCHEMA public TO ${process.env.APP_DB_USER}`);
await tempPool.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${process.env.APP_DB_USER}`);
await tempPool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ${process.env.APP_DB_USER}`);
```

Los mismos permisos se otorgan al editar una base de datos.

### 4. ✅ Mejorar script de inicialización
**Archivo:** `DB-Usuarios/init.sh`

Ahora incluye:
- Permisos CREATEDB para `CreacionTablas_user`
- Permisos USAGE en schema public para ambos usuarios
- Permisos por defecto en schema public
- Timeout de seguridad de 15s para ambos usuarios

## Cómo Aplicar los Cambios

### 1. Reconstruir los contenedores
```bash
docker compose -f docker-compose.build.yml down -v
docker compose -f docker-compose.build.yml up --build -d
```

**⚠️ IMPORTANTE:** El flag `-v` eliminará los volúmenes, perdiendo todas las bases de datos existentes. Si tienes datos importantes, haz backup primero.

### 2. Verificar que los contenedores estén corriendo
```bash
docker compose -f docker-compose.build.yml ps
```

Deberías ver:
- express (running)
- postgres (running)
- postgres-usuarios (running)
- adminer (running)
- nginx (running)
- cloudflared (running)

### 3. Verificar logs de PostgreSQL
```bash
docker compose -f docker-compose.build.yml logs postgres-usuarios
```

Busca el mensaje:
```
✅ Usuarios y permisos configurados correctamente
```

### 4. Probar el ejecutor SQL

1. Crear una base de datos de prueba desde el frontend
2. Ir a "Resolver Ejercicio" 
3. Ejecutar una consulta SELECT:
   ```sql
   SELECT * FROM nombre_tabla;
   ```

Debería funcionar sin errores de permisos.

## Verificación de Permisos

Si quieres verificar manualmente los permisos, conéctate a postgres-usuarios:

```bash
docker compose -f docker-compose.build.yml exec postgres-usuarios psql -U alfajor123 -d ID_1
```

Luego verifica permisos:
```sql
-- Ver permisos en la base de datos
\l+ ID_1

-- Ver permisos en tablas
\dp

-- Probar SELECT con usuario de lectura
SET ROLE usuario_lectura123;
SELECT * FROM tu_tabla;
```

## Variables de Entorno Relevantes

Asegúrate de que estas variables estén en tu `.env`:

```bash
# Usuario administrador de PostgreSQL
POSTGRES_USER=alfajor123
POSTGRES_PASSWORD=alfajor123
POSTGRES_PORT=5432

# Usuario de solo lectura (para ejecutar queries)
APP_DB_USER=usuario_lectura123
APP_DB_PASS=mi_clave_segura123

# Usuario para crear tablas
CreacionTablas_user=sololectura123
CreacionTablas_pass=mi_clave_segura123

# Host del contenedor postgres-usuarios
POSTGRES_HOST_usuarios=postgres-usuarios
```

## Estructura de Permisos

### Usuario: `APP_DB_USER` (usuario_lectura123)
- ✅ CONNECT en todas las bases de datos
- ✅ USAGE en schema public
- ✅ SELECT en todas las tablas
- ❌ INSERT, UPDATE, DELETE (denegado)
- ⏱️ Timeout: 15 segundos

### Usuario: `CreacionTablas_user` (sololectura123)
- ✅ CONNECT en todas las bases de datos
- ✅ CREATEDB (puede crear bases de datos)
- ✅ CREATE, USAGE en schema public
- ✅ ALL PRIVILEGES en tablas y secuencias
- ⏱️ Timeout: 15 segundos

## Debugging

Si sigues teniendo problemas:

### 1. Verificar conexión
```bash
docker compose -f docker-compose.build.yml exec express env | grep APP_DB
```

Debe mostrar:
```
APP_DB_USER=usuario_lectura123
APP_DB_PASS=mi_clave_segura123
```

### 2. Ver logs del backend
```bash
docker compose -f docker-compose.build.yml logs -f express
```

Busca errores relacionados con PostgreSQL.

### 3. Probar conexión manualmente
```bash
docker compose -f docker-compose.build.yml exec postgres-usuarios psql -U usuario_lectura123 -d ID_1
```

Si no puedes conectarte, hay un problema con los permisos básicos.

## Archivos Modificados

1. ✅ `back/config/DB_lectura.js` - Puerto dinámico
2. ✅ `back/rutas/BaseDatos/UsarBaseDatos.js` - Pool correcto
3. ✅ `back/rutas/BaseDatos/CrearBaseDatos.js` - Permisos automáticos (2 lugares)
4. ✅ `DB-Usuarios/init.sh` - Script de inicialización mejorado

## Fecha de Fix

15 de octubre de 2025

## Testing Checklist

- [ ] Reconstruir contenedores con `docker compose down -v && docker compose up --build`
- [ ] Crear una nueva base de datos desde el frontend
- [ ] Crear un ejercicio que use esa base de datos
- [ ] Intentar resolver el ejercicio
- [ ] Ejecutar query SELECT en el editor SQL
- [ ] Verificar que devuelve resultados sin errores
- [ ] Intentar ejecutar INSERT (debería fallar con error de permisos - esperado)
- [ ] Ver tablas disponibles funciona correctamente
