# Validaciones SQL Completas - Sistema de Creación de Bases de Datos

## 📋 Resumen

El sistema implementa **validaciones en múltiples capas** para garantizar seguridad, compatibilidad y buenas prácticas al crear bases de datos PostgreSQL.

## 🎯 Capas de Validación

### 1️⃣ **Frontend - Validación en Tiempo Real** ⚡
**Ubicación:** `FormularioCrearDB.jsx` y `FormularioEditarDB.jsx`

**Propósito:** Educación inmediata del usuario mientras escribe SQL

**Características:**
- ✅ Validación instantánea mientras el usuario escribe
- ✅ Alertas visuales con fondo rojo
- ✅ Mensajes educativos y específicos
- ✅ No bloquea el envío (solo advierte)

### 2️⃣ **Backend - Validación Pre-Ejecución** 🛡️
**Ubicación:** `back/rutas/BaseDatos/CrearBaseDatos.js` → función `validarSQLVAR()`

**Propósito:** Seguridad real antes de ejecutar SQL

**Características:**
- ✅ Bloquea operaciones peligrosas
- ✅ Rechaza el request si hay errores
- ✅ Capa de seguridad definitiva

---

## 🚨 Validaciones Frontend (Tiempo Real)

### Categoría 1: Seguridad - Acceso al Sistema

| Patrón | Mensaje | Razón |
|--------|---------|-------|
| `pg_*` | Acceso a tablas del sistema (pg_*) no está permitido. | Protege metadatos internos de PostgreSQL |
| `INFORMATION_SCHEMA.` | Acceso a INFORMATION_SCHEMA no está permitido. | Previene consultas sobre estructura del sistema |
| `PG_CATALOG.` | Acceso a PG_CATALOG no está permitido. | Protege catálogo interno de PostgreSQL |
| `CURRENT_USER` | La función CURRENT_USER no está permitida. | Evita filtración de información del usuario |
| `CURRENT_DATABASE` | La función CURRENT_DATABASE no está permitida. | Evita filtración de información de la BD |
| `SESSION_USER` | La función SESSION_USER no está permitida. | Evita filtración de información de sesión |
| `PG_SLEEP` | La función PG_SLEEP no está permitida. | Previene ataques de denegación de servicio |

### Categoría 2: Restricciones Backend - Solo CREATE TABLE e INSERT INTO

**⚠️ IMPORTANTE:** El SQL inicial **SOLO puede contener** `CREATE TABLE` e `INSERT INTO`. Estas validaciones reflejan las restricciones del backend.

| Patrón | Mensaje | Razón |
|--------|---------|-------|
| `DROP` | DROP no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Eliminación no permitida en inicialización |
| `UPDATE` | UPDATE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Modificación no permitida en inicialización |
| `ALTER` | ALTER no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Alteraciones no permitidas en inicialización |
| `GRANT` | GRANT no está permitido. Los permisos se asignan automáticamente. | Sistema maneja permisos |
| `REVOKE` | REVOKE no está permitido. Los permisos se gestionan automáticamente. | Sistema maneja permisos |
| `TRUNCATE` | TRUNCATE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Borrado masivo no permitido |
| `REPLACE` | REPLACE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Reemplazo no permitido |
| `EXECUTE` | EXECUTE no está permitido por razones de seguridad. | Ejecución arbitraria peligrosa |
| `MERGE` | MERGE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Operación compleja no permitida |
| `FUNCTION` | CREATE FUNCTION no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Funciones pueden agregarse después |
| `TRIGGER` | CREATE TRIGGER no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Triggers pueden agregarse después |
| `INDEX` | CREATE INDEX no está permitido en SQL inicial. Los índices pueden agregarse después. | Índices pueden agregarse después |
| `SEQUENCE` | CREATE SEQUENCE no está permitido. Usa SERIAL en su lugar. | Usa SERIAL para auto-incremento |
| `VIEW` | CREATE VIEW no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Vistas pueden agregarse después |
| `RULE` | CREATE RULE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Reglas pueden agregarse después |
| `CAST` | CREATE CAST no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO. | Casts personalizados no permitidos |
| `EXTENSION` | CREATE EXTENSION no está permitido. Las extensiones las gestiona el administrador. | Extensiones manejadas por admin |
| `OWNER TO` | OWNER TO no está permitido. El propietario se asigna automáticamente. | Ownership asignado automáticamente |
| `SECURITY` | Configuraciones de SECURITY no están permitidas en SQL inicial. | Configuraciones de seguridad no permitidas |

### Categoría 3: Incompatibilidades MySQL → PostgreSQL

#### 🔄 Tipos de Datos

| MySQL | PostgreSQL | Mensaje Frontend |
|-------|-----------|------------------|
| `AUTO_INCREMENT` | `SERIAL` o `GENERATED ALWAYS AS IDENTITY` | AUTO_INCREMENT es de MySQL. En PostgreSQL usa SERIAL o GENERATED ALWAYS AS IDENTITY. |
| `TINYINT` | `SMALLINT` | TINYINT no existe en PostgreSQL. Usa SMALLINT en su lugar. |
| `MEDIUMINT` | `INTEGER` | MEDIUMINT no existe en PostgreSQL. Usa INTEGER en su lugar. |
| `DOUBLE` | `DOUBLE PRECISION` o `REAL` | DOUBLE sin PRECISION no es estándar. En PostgreSQL usa DOUBLE PRECISION o REAL. |
| `DATETIME` | `TIMESTAMP` | DATETIME no existe en PostgreSQL. Usa TIMESTAMP en su lugar. |

**Ejemplos:**

```sql
-- ❌ MySQL
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    edad TINYINT,
    saldo DOUBLE,
    creado DATETIME
);

-- ✅ PostgreSQL
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    edad SMALLINT,
    saldo DOUBLE PRECISION,
    creado TIMESTAMP
);
```

#### ⚙️ Características de Motor

| MySQL | PostgreSQL | Mensaje Frontend |
|-------|-----------|------------------|
| `ENGINE=InnoDB` | No necesario | ENGINE=InnoDB es de MySQL. PostgreSQL no necesita especificar motor de almacenamiento. |
| `UNSIGNED` | Tipos numéricos + `CHECK` | UNSIGNED no existe en PostgreSQL. Usa tipos numéricos apropiados o CHECK constraints. |
| `ZEROFILL` | `LPAD()` | ZEROFILL no existe en PostgreSQL. Formatea en la aplicación o usa LPAD(). |

**Ejemplos:**

```sql
-- ❌ MySQL
CREATE TABLE productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cantidad INT(5) ZEROFILL
) ENGINE=InnoDB;

-- ✅ PostgreSQL
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    cantidad INTEGER CHECK (cantidad >= 0)
);
```

#### 📝 Sintaxis

| MySQL | PostgreSQL | Mensaje Frontend |
|-------|-----------|------------------|
| Backticks `` `tabla` `` | Comillas dobles `"tabla"` o sin comillas | Backticks (`) son de MySQL. En PostgreSQL usa comillas dobles ("tabla") o sin comillas. |
| `LIMIT 10, 5` | `LIMIT 5 OFFSET 10` | Sintaxis LIMIT offset,count es de MySQL. En PostgreSQL usa LIMIT count OFFSET offset. |
| `ENUM('val1', 'val2')` | `CREATE TYPE nombre AS ENUM(...)` | ENUM con sintaxis MySQL detectado. En PostgreSQL crea el tipo con CREATE TYPE nombre AS ENUM (...). |

**Ejemplos:**

```sql
-- ❌ MySQL
SELECT * FROM `usuarios` LIMIT 10, 5;

CREATE TABLE estado (
    nombre VARCHAR(50),
    tipo ENUM('activo', 'inactivo')
);

-- ✅ PostgreSQL
SELECT * FROM usuarios LIMIT 5 OFFSET 10;

CREATE TYPE tipo_estado AS ENUM ('activo', 'inactivo');
CREATE TABLE estado (
    nombre VARCHAR(50),
    tipo tipo_estado
);
```

---

## 🛡️ Validaciones Backend (Pre-Ejecución)

**Ubicación:** `validarSQLVAR()` en `CrearBaseDatos.js`

### Operaciones Permitidas
✅ Solo `CREATE` e `INSERT`

### Operaciones Bloqueadas

| Operación | Razón |
|-----------|-------|
| `DROP` | Eliminación permanente |
| `UPDATE` | Modificación de datos (solo init con INSERT) |
| `ALTER` | Cambios estructurales no permitidos en init |
| `GRANT` | Sistema maneja permisos automáticamente |
| `TRUNCATE` | Borrado masivo innecesario en init |
| `REPLACE` | Operación de modificación |
| `EXECUTE` | Ejecución arbitraria insegura |
| `MERGE` | Operación compleja no permitida |
| `FUNCTION` | Creación de funciones no permitida |
| `TRIGGER` | Creación de triggers no permitida |
| `INDEX` | Índices pueden agregarse después |
| `SEQUENCE` | Secuencias manejadas por SERIAL |
| `VIEW` | Vistas pueden agregarse después |
| `RULE` | Reglas no permitidas en init |
| `CAST` | Casting explícito innecesario |
| `EXTENSION` | Extensiones manejadas por administrador |
| `OWNER TO` | Ownership asignado automáticamente |
| `SECURITY` | Configuración de seguridad no permitida |

### Ejemplo de SQL Válido

```sql
-- ✅ PERMITIDO - Solo CREATE TABLE e INSERT INTO
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    edad SMALLINT CHECK (edad >= 0),
    activo BOOLEAN DEFAULT TRUE,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200),
    precio DECIMAL(10,2),
    usuario_id INTEGER REFERENCES usuarios(id)
);

INSERT INTO usuarios (nombre, email, edad) VALUES 
    ('Juan Pérez', 'juan@example.com', 30),
    ('María García', 'maria@example.com', 25);

INSERT INTO productos (nombre, precio, usuario_id) VALUES
    ('Producto 1', 99.99, 1),
    ('Producto 2', 149.99, 2);
```

### Ejemplo de SQL Bloqueado

```sql
-- ❌ BLOQUEADO - UPDATE
UPDATE usuarios SET nombre = 'Otro' WHERE id = 1;
-- Frontend: ⚠️ "UPDATE no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO."
-- Backend: ❌ "Solo se permiten sentencias CREATE e INSERT. Detectado: UPDATE"

-- ❌ BLOQUEADO - DROP
DROP TABLE IF EXISTS usuarios;
-- Frontend: ⚠️ "DROP no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO."
-- Backend: ❌ "Solo se permiten sentencias CREATE e INSERT. Detectado: DROP"

-- ❌ BLOQUEADO - CREATE FUNCTION
CREATE FUNCTION suma(a INT, b INT) RETURNS INT AS $$
BEGIN
    RETURN a + b;
END;
$$ LANGUAGE plpgsql;
-- Frontend: ⚠️ "CREATE FUNCTION no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO."
-- Backend: ❌ "Uso de estructura prohibida: /\bFUNCTION\b/i"

-- ❌ BLOQUEADO - CREATE INDEX
CREATE INDEX idx_nombre ON usuarios(nombre);
-- Frontend: ⚠️ "CREATE INDEX no está permitido en SQL inicial. Los índices pueden agregarse después."
-- Backend: ❌ "Uso de estructura prohibida: /\bINDEX\b/i"

-- ❌ BLOQUEADO - CREATE VIEW
CREATE VIEW usuarios_activos AS SELECT * FROM usuarios WHERE activo = TRUE;
-- Frontend: ⚠️ "CREATE VIEW no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO."
-- Backend: ❌ "Uso de estructura prohibida: /\bVIEW\b/i"

-- ❌ BLOQUEADO - GRANT
GRANT SELECT ON usuarios TO public;
-- Frontend: ⚠️ "GRANT no está permitido. Los permisos se asignan automáticamente."
-- Backend: ❌ "Uso de estructura prohibida: /\bGRANT\b/i"

-- ❌ BLOQUEADO - AUTO_INCREMENT (MySQL)
CREATE TABLE test (id INT AUTO_INCREMENT PRIMARY KEY);
-- Frontend: ⚠️ "AUTO_INCREMENT es de MySQL. En PostgreSQL usa SERIAL..."
-- Backend: ✅ Pasaría (CREATE válido) pero frontend ya advierte
```

---

## 🎨 Experiencia de Usuario

### Flujo de Validación

```
┌─────────────────────────┐
│ Usuario escribe SQL     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Validación Frontend     │ ⚡ Tiempo Real
│ (Advertencias visuales) │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Usuario envía form      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Validación Backend      │ 🛡️ Seguridad
│ (Bloqueo definitivo)    │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ ERROR  │ │  OK    │
│Rechaza │ │Ejecuta │
└────────┘ └────────┘
```

### Alertas Visuales Frontend

```jsx
<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
    <div className="flex items-center gap-3">
        <FaExclamationTriangle className="text-2xl flex-shrink-0" />
        <div>
            <p className="font-bold text-lg">Advertencia de seguridad</p>
            <p className="text-sm mt-1">AUTO_INCREMENT es de MySQL. En PostgreSQL usa SERIAL...</p>
        </div>
    </div>
</div>
```

---

## 📊 Resumen de Validaciones

### Frontend (38 Patrones)
- 🔒 **7** Seguridad de sistema
- 🚫 **18** Restricciones backend (solo CREATE TABLE + INSERT INTO)
- 🔄 **13** Incompatibilidades MySQL/PostgreSQL

### Backend (18 Patrones)
- 🚫 Solo permite `CREATE` e `INSERT`
- 🛡️ Bloquea 18 operaciones/estructuras peligrosas

### Cobertura Total
✅ **56 validaciones únicas** (38 frontend + 18 backend con overlap)
✅ Educación + Seguridad
✅ Compatibilidad MySQL → PostgreSQL
✅ Protección contra errores comunes
✅ **Frontend y Backend sincronizados**

---

## 🧪 Casos de Prueba

### Test 1: Incompatibilidad MySQL
```sql
CREATE TABLE test (
    id INT AUTO_INCREMENT PRIMARY KEY
);
```
**Resultado Frontend:** ⚠️ "AUTO_INCREMENT es de MySQL..."
**Resultado Backend:** ✅ Permitido (CREATE válido)

### Test 2: Operación Bloqueada - DROP
```sql
DROP TABLE usuarios;
```
**Resultado Frontend:** ⚠️ "DROP no está permitido en SQL inicial. Solo CREATE TABLE e INSERT INTO."
**Resultado Backend:** ❌ BLOQUEADO "Solo se permiten CREATE e INSERT"

### Test 3: Acceso al Sistema
```sql
SELECT * FROM pg_tables;
```
**Resultado Frontend:** ⚠️ "Acceso a tablas del sistema (pg_*) no está permitido"
**Resultado Backend:** ❌ BLOQUEADO "Solo se permiten CREATE e INSERT"

### Test 4: SQL Válido Completo
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100)
);

INSERT INTO usuarios (nombre) VALUES ('Juan');
```
**Resultado Frontend:** ✅ Sin advertencias
**Resultado Backend:** ✅ EJECUTADO correctamente

---

## 📝 Buenas Prácticas

### ✅ Recomendaciones

1. **Usa solo CREATE TABLE e INSERT INTO en SQL inicial**
   - ✅ `CREATE TABLE nombre (...)`
   - ✅ `INSERT INTO tabla (columnas) VALUES (...)`
   - ❌ No uses `UPDATE`, `DELETE`, `ALTER`, `DROP`
   - ❌ No uses `CREATE INDEX`, `CREATE VIEW`, `CREATE FUNCTION`

2. **Usa tipos nativos de PostgreSQL**
   - `SERIAL` en lugar de `AUTO_INCREMENT`
   - `TIMESTAMP` en lugar de `DATETIME`
   - `SMALLINT` en lugar de `TINYINT`

3. **Evita características específicas de MySQL**
   - No uses backticks, usa comillas dobles o sin comillas
   - No uses `UNSIGNED`, usa `CHECK` constraints
   - No uses `ENGINE=`, PostgreSQL no lo necesita

4. **Estructura SQL inicial simple**
   - Define solo las tablas base
   - Inserta solo datos iniciales necesarios
   - Índices, vistas, funciones y triggers pueden agregarse después mediante ALTER (fuera del SQL inicial)

5. **Revisa las advertencias del frontend**
   - Son educativas y te ayudan a evitar errores
   - Corrige antes de enviar para evitar errores backend
   - **Frontend y backend tienen las mismas validaciones**

### ❌ Evitar

1. **No uses operaciones de modificación en SQL inicial**
   - ❌ `UPDATE`, `DELETE`, `TRUNCATE`
   - ✅ Solo `INSERT` para datos

2. **No uses operaciones administrativas**
   - ❌ `GRANT`, `REVOKE`, `OWNER TO`
   - ✅ El sistema maneja permisos automáticamente

3. **No accedas a tablas del sistema**
   - ❌ `pg_*`, `information_schema`, `pg_catalog`
   - ✅ Usa solo tus propias tablas

---

## 🔧 Configuración Técnica

### Variables de Entorno Usadas
```env
APP_DB_USER=usuario_lectura123
CreacionTablas_user=sololectura123
POSTGRES_USER=alfajor123
```

### Permisos Otorgados Automáticamente
```sql
GRANT CONNECT ON DATABASE "ID_X" TO usuario_lectura123;
GRANT USAGE ON SCHEMA public TO usuario_lectura123;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO usuario_lectura123;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO usuario_lectura123;
```

---

## 📅 Fecha de Implementación

19 de octubre de 2025

## 🟢 Estado

**ACTIVO Y FUNCIONANDO**

- ✅ Validación frontend en tiempo real
- ✅ Validación backend pre-ejecución
- ✅ 45+ patrones de validación
- ✅ Mensajes educativos específicos
- ✅ Guía de migración MySQL → PostgreSQL incluida
