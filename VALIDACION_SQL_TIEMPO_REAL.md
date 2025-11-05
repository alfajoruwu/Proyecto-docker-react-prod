# Validación SQL en Tiempo Real - Editor de Creación de Bases de Datos

## Funcionalidad Implementada

Se ha agregado una **validación en tiempo real** en el editor SQL de creación/edición de bases de datos que muestra advertencias cuando el usuario escribe palabras o patrones SQL prohibidos relacionados con seguridad y acceso al sistema.

## Ubicación

Esta funcionalidad está implementada en:
- ✅ **FormularioCrearDB.jsx** - Modal de editor SQL al crear bases de datos
- ✅ **FormularioEditarDB.jsx** - Modal de editor SQL al editar bases de datos

## Características

### ✅ Validación Instantánea
- Se valida el SQL mientras el usuario escribe en el editor
- Las advertencias aparecen inmediatamente arriba del editor CodeMirror
- Se actualiza automáticamente al modificar la consulta

### 🚨 Alerta Visual
- **Posición:** Justo arriba del editor CodeMirror dentro del modal "EditarSQL"
- **Estilo:** Div con fondo rojo (bg-red-100), borde izquierdo rojo grueso (border-l-4 border-red-500)
- **Contenido:** Ícono de advertencia + título "Advertencia de seguridad" + mensaje específico

### 🎯 Palabras y Patrones Bloqueados

**NOTA:** Esta validación se enfoca en operaciones de seguridad y acceso al sistema de PostgreSQL. Las operaciones DDL normales (CREATE, DROP, ALTER, INSERT, etc.) **SÍ están permitidas** ya que son necesarias para la creación de bases de datos.

#### Acceso a Tablas del Sistema
- ✅ **PG_*** - "Acceso a tablas del sistema (pg_*) no está permitido."
- ✅ **INFORMATION_SCHEMA.** - "Acceso a INFORMATION_SCHEMA no está permitido."
- ✅ **PG_CATALOG.** - "Acceso a PG_CATALOG no está permitido."

#### Funciones de Metadatos y Seguridad
- ✅ **CURRENT_USER** - "La función CURRENT_USER no está permitida."
- ✅ **CURRENT_DATABASE** - "La función CURRENT_DATABASE no está permitida."
- ✅ **SESSION_USER** - "La función SESSION_USER no está permitida."
- ✅ **PG_SLEEP** - "La función PG_SLEEP no está permitida."

## Ejemplos de Uso

### ❌ Consulta Prohibida - Acceso a Sistema
```sql
SELECT * FROM pg_tables;
```
**Advertencia mostrada:**
```
⚠️ Advertencia de seguridad
Acceso a tablas del sistema (pg_*) no está permitido.
```

### ❌ Consulta Prohibida - Función de Sistema
```sql
SELECT CURRENT_USER;
```
**Advertencia mostrada:**
```
⚠️ Advertencia de seguridad
La función CURRENT_USER no está permitida.
```

### ✅ Consulta Permitida - Creación de Tabla
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    edad INT
);

INSERT INTO usuarios (nombre, edad) VALUES ('Juan', 25);
```
**Sin advertencias** - Las operaciones DDL normales están permitidas.

## Implementación Técnica

### Estados React
```javascript
const [advertenciaSQL, setAdvertenciaSQL] = useState(null);
```

### Función de Validación
```javascript
const validarSQLTiempoReal = (sql) => {
    // Limpia comentarios y normaliza
    const sqlLimpio = sql
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();

    // Array de prohibiciones (solo seguridad y sistema)
    const prohibiciones = [
        { patron: /\bPG_\w+/, mensaje: 'Acceso a tablas del sistema (pg_*) no está permitido.' },
        { patron: /\bINFORMATION_SCHEMA\./, mensaje: 'Acceso a INFORMATION_SCHEMA no está permitido.' },
        { patron: /\bPG_CATALOG\./, mensaje: 'Acceso a PG_CATALOG no está permitido.' },
        { patron: /\bCURRENT_USER\b/, mensaje: 'La función CURRENT_USER no está permitida.' },
        { patron: /\bCURRENT_DATABASE\b/, mensaje: 'La función CURRENT_DATABASE no está permitida.' },
        { patron: /\bSESSION_USER\b/, mensaje: 'La función SESSION_USER no está permitida.' },
        { patron: /\bPG_SLEEP\b/, mensaje: 'La función PG_SLEEP no está permitida.' },
    ];

    // Busca la primera coincidencia
    for (const { patron, mensaje } of prohibiciones) {
        if (patron.test(sqlLimpio)) {
            setAdvertenciaSQL({ tipo: 'error', mensaje });
            return;
        }
    }

    // Sin errores
    setAdvertenciaSQL(null);
};
```

### Integración con CodeMirror
```javascript
<CodeMirror
    value={SQLinicial}
    onChange={(value) => {
        SeterSQLinicial(value);
        validarSQLTiempoReal(value);  // Validación en cada cambio
    }}
    extensions={[sql()]}
    height='50vh'
/>
```

### Componente de Alerta (Div con fondo rojo)
```jsx
{advertenciaSQL && (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-2xl flex-shrink-0" />
            <div>
                <p className="font-bold text-lg">Advertencia de seguridad</p>
                <p className="text-sm mt-1">{advertenciaSQL.mensaje}</p>
            </div>
        </div>
    </div>
)}
```

## Ventajas

### 🎓 Educativo
- Los usuarios aprenden qué operaciones de sistema están prohibidas
- Explicaciones claras sobre seguridad de PostgreSQL
- Retroalimentación inmediata sin necesidad de ejecutar

### ⚡ Prevención de Errores
- Evita intentos de acceso a tablas del sistema
- Reduce llamadas al servidor con consultas inseguras
- Ahorra tiempo al usuario

### 🔒 Seguridad
- Primera capa de validación en el cliente
- Educación sobre prácticas seguras con PostgreSQL
- Complementa la validación del backend
- **Permite operaciones DDL normales** (CREATE, DROP, etc.) necesarias para bases de datos

### 🎨 UX Mejorada
- Feedback visual inmediato con diseño llamativo (fondo rojo)
- No interrumpe el flujo de trabajo
- Mensajes claros y específicos
- Diseño consistente con Tailwind CSS

## Flujo de Validación Completo

```
┌─────────────────────┐
│ Usuario escribe SQL │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ onChange en CodeMirror      │
│ - Actualiza estado SQL      │
│ - Llama validarSQLTiempoReal│
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Validación en Tiempo Real   │
│ - Limpia comentarios        │
│ - Normaliza espacios        │
│ - Convierte a mayúsculas    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Verifica patrones prohibidos│
└──────────┬──────────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌──────────┐
│Prohibido│  │Permitido │
└────┬────┘  └────┬─────┘
     │            │
     ▼            ▼
┌──────────┐  ┌─────────────┐
│Mostrar   │  │Sin          │
│Advertencia│  │advertencia  │
└──────────┘  └─────────────┘
```

## Validación Backend vs Frontend

### Frontend (Tiempo Real) ⚡
- **Propósito:** UX y educación
- **Cuándo:** Mientras escribe
- **Acción:** Muestra advertencia visual
- **Permite ejecución:** No previene el click en "Ejecutar"

### Backend (Pre-ejecución) 🛡️
- **Propósito:** Seguridad real
- **Cuándo:** Al ejecutar la consulta
- **Acción:** Rechaza la petición
- **Última palabra:** Decisión final de seguridad

### ⚠️ Importante
La validación frontend es **educativa y de UX**, NO reemplaza la validación del backend que es la **capa de seguridad real**.

## Personalización

### Agregar Nueva Prohibición
```javascript
const prohibiciones = [
    // ... prohibiciones existentes
    { 
        patron: /\bNUEVA_PALABRA\b/, 
        mensaje: 'NUEVA_PALABRA no está permitida. Razón específica.' 
    },
];
```

### Cambiar Estilos
```jsx
<div className="alert alert-error shadow-lg mb-2">
    {/* Cambiar a alert-warning para advertencias menos críticas */}
</div>
```

### Modificar Posición
El componente está ubicado entre el header y el editor:
```jsx
<div className="header">...</div>
{advertenciaSQL && <Alert />}  {/* Aquí */}
<div className="editor">...</div>
```

## Testing

### Casos de Prueba

1. **Escribir "SELECT * FROM pg_tables"**
   - ✅ Debe mostrar advertencia
   - ✅ Mensaje correcto sobre acceso a sistema

2. **Escribir "CREATE TABLE usuarios (id INT)"**
   - ✅ No debe mostrar advertencia
   - ✅ Permite operaciones DDL normales

3. **Escribir comentario con palabra prohibida**
   - ✅ `-- SELECT * FROM pg_catalog.pg_tables` no debe alertar
   - ✅ Comentarios son ignorados

4. **Escribir "SELECT CURRENT_USER"**
   - ✅ Debe alertar por función de sistema
   - ✅ Mensaje sobre CURRENT_USER

5. **Borrar consulta**
   - ✅ Advertencia desaparece
   - ✅ No hay error con texto vacío

6. **Escribir "INSERT INTO tabla VALUES (1)"**
   - ✅ No debe mostrar advertencia
   - ✅ INSERT está permitido en creación de DB

## Archivos Modificados

- ✅ `front/src/Vistas/CrearDB/FormularioCrearDB.jsx`
  - Agregado estado `advertenciaSQL`
  - Agregada función `validarSQLTiempoReal()`
  - Modificado `onChange` de CodeMirror en modal EditarSQL
  - Agregado div de advertencia con fondo rojo
  - Importado ícono `FaExclamationTriangle`

- ✅ `front/src/Vistas/CrearDB/FormularioEditarDB.jsx`
  - Agregado estado `advertenciaSQL`
  - Agregada función `validarSQLTiempoReal()`
  - Modificado `onChange` de CodeMirror en modal EditarSQL
  - Agregado div de advertencia con fondo rojo
  - Importado ícono `FaExclamationTriangle`

- ✅ `front/src/Vistas/EjecucionSQL/RealizarEjercicio.jsx`
  - **ELIMINADA** la validación SQL de este componente
  - Ya no valida en el editor de ejercicios

## Diferencias con la Validación de Ejercicios

### Componente de Creación de DB (Actual)
- ✅ Permite CREATE, DROP, ALTER, INSERT, DELETE, etc.
- ⛔ Bloquea solo acceso a sistema PostgreSQL
- 🎯 Enfoque: Seguridad y metadatos
- 📍 Ubicación: FormularioCrearDB + FormularioEditarDB

### Componente de Ejercicios (Ya NO tiene validación)
- ✅ Sin validación en tiempo real
- 🎯 Solo validación backend al ejecutar
- 📍 Ubicación: RealizarEjercicio.jsx

## Fecha de Implementación

19 de octubre de 2025

## Estado

🟢 **IMPLEMENTADO Y ACTIVO**

La validación está funcionando en los editores SQL de los formularios de creación/edición de bases de datos.

**NOTA IMPORTANTE:** Esta validación se enfoca en **seguridad y acceso al sistema PostgreSQL**, NO bloquea operaciones DDL normales que son necesarias para crear bases de datos (CREATE TABLE, INSERT, DROP, etc.). Solo bloquea intentos de acceder a tablas del sistema como pg_tables, pg_catalog, information_schema, y funciones sensibles como CURRENT_USER.
