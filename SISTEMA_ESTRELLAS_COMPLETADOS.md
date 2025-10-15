# Sistema de Estrellas y Estadísticas de Ejercicios

## 📝 Descripción
Sistema completo para que los usuarios puedan dar estrellas (favoritos) a ejercicios y ver estadísticas de cuántas personas han completado cada ejercicio, además de distinguir visualmente los ejercicios que ya resolvieron.

## 🎯 Funcionalidades Implementadas

### 1. **Sistema de Estrellas (Favoritos)**
- ✅ Cada usuario puede dar/quitar una estrella a cualquier ejercicio
- ✅ Contador de estrellas totales por ejercicio
- ✅ Indicador visual de si el usuario actual ya dio estrella
- ✅ Botón interactivo que cambia de icono según el estado

### 2. **Estadísticas de Completados**
- ✅ Muestra cuántas personas diferentes han completado cada ejercicio
- ✅ Indicador visual cuando el usuario actual ha completado un ejercicio
- ✅ Borde verde y badge de "Completado" en ejercicios resueltos

### 3. **Filtros Mejorados**
- ✅ Filtrar por ejercicios resueltos por el usuario
- ✅ Filtrar por ejercicios no resueltos
- ✅ Ordenar por fecha, dificultad, etc.

## 🔧 Archivos Creados/Modificados

### Backend

#### **Nuevo Archivo**: `/back/rutas/Ejercicios/Estrellas.js`
Endpoints creados:

1. **`POST /ejericicios/toggle-estrella`**
   - Toggle estrella (agregar/quitar)
   - Protegido con autenticación
   - Retorna estado actualizado y total de estrellas

2. **`GET /ejericicios/ejercicios-con-stats`**
   - Obtiene todos los ejercicios con estadísticas
   - Incluye:
     - Total de estrellas del ejercicio
     - Si el usuario actual dio estrella
     - Cuántas personas completaron el ejercicio
     - Si el usuario actual lo completó
   - Protegido con autenticación

#### **Modificado**: `/back/app.js`
- Registrada nueva ruta `Estrellas`

### Frontend

#### **Modificado**: `/front/src/Vistas/Principal/MostrarCartasEjercicio.jsx`
- ✅ Importado `FaRegStar` para icono de estrella vacía
- ✅ Añadida prop `onActualizarEjercicios`
- ✅ Función `handleToggleEstrella` para dar/quitar estrellas
- ✅ Cards con borde verde para ejercicios completados
- ✅ Badge "Completado" con icono
- ✅ Botón de estrella funcional con estados:
  - Estrella vacía (outline) si no tiene estrella
  - Estrella llena (warning) si ya tiene estrella
  - Tooltip descriptivo

#### **Modificado**: `/front/src/Vistas/Principal/Principal.jsx`
- ✅ Cambiado endpoint a `/ejercicios-con-stats`
- ✅ Pasada función `onActualizarEjercicios` al componente
- ✅ Actualizado filtro de resueltos para usar campo `completado`

## 📊 Estructura de Datos

### Respuesta del endpoint `ejercicios-con-stats`:
```javascript
{
  ejercicios: [
    {
      id: 1,
      nombre_ej: "SELECT básico",
      problema: "...",
      descripcion: "...",
      dificultad: 1,
      topicos: ["SELECT", "WHERE"],
      // ... otros campos ...
      estrellas: 5,              // Total de estrellas
      tiene_estrella: true,      // Usuario actual dio estrella
      veces_completado: 12,      // Personas que lo completaron
      completado: true           // Usuario actual lo completó
    }
  ]
}
```

## 🎨 Cambios Visuales

### **Tarjetas de Ejercicios:**

**Antes:**
```
┌─────────────────────────────┐
│ Ejercicio 1      [Fácil]    │
│ ─────────────────────────── │
│ Descripción...              │
│ Estrellas: 5                │
│ [Resolver] [⭐]              │
└─────────────────────────────┘
```

**Ahora - Ejercicio No Completado:**
```
┌─────────────────────────────┐
│ Ejercicio 1      [Fácil]    │
│ ─────────────────────────── │
│ Descripción...              │
│ ⭐ 5                         │
│ Completados: 12 personas    │
│ [Resolver] [☆]              │  ← Estrella vacía
└─────────────────────────────┘
```

**Ahora - Ejercicio Completado (por el usuario):**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ← Borde verde
┃ ✓ Ejercicio 1  [Completado] ┃  ← Header verde
┃ ─────────────────────────── ┃
┃ Descripción...              ┃
┃ ⭐ 8                         ┃
┃ Completados: 15 personas    ┃
┃ [Resolver] [⭐]              ┃  ← Estrella llena (amarilla)
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## 🔄 Flujo de Interacción

### **Dar/Quitar Estrella:**
1. Usuario hace click en el botón de estrella
2. Se envía petición POST a `/toggle-estrella`
3. Backend verifica si existe la estrella
4. Si existe: la elimina
5. Si no existe: la crea
6. Retorna estado actualizado
7. Frontend recarga la lista de ejercicios
8. Toast de confirmación

### **Ver Ejercicios Completados:**
1. Usuario completa un ejercicio (Es_Correcto = true)
2. Se registra en tabla `Intentos`
3. La próxima vez que carga ejercicios, ve el borde verde
4. El filtro "Resueltos" muestra solo esos ejercicios

## 📝 Consultas SQL Importantes

### Contar estrellas de un ejercicio:
```sql
SELECT COUNT(*) FROM Estrellas WHERE ID_Ejercicio = $1
```

### Verificar si usuario dio estrella:
```sql
SELECT 1 FROM Estrellas 
WHERE ID_Usuario = $1 AND ID_Ejercicio = $2
```

### Contar personas que completaron:
```sql
SELECT COUNT(DISTINCT ID_Usuario) 
FROM Intentos 
WHERE ID_Ejercicio = $1 
  AND Es_Correcto = true 
  AND Tipo = 'RevisarRespuesta'
```

### Verificar si usuario completó:
```sql
SELECT 1 FROM Intentos 
WHERE ID_Usuario = $1 
  AND ID_Ejercicio = $2 
  AND Es_Correcto = true 
  AND Tipo = 'RevisarRespuesta'
```

## 🎯 Beneficios del Sistema

1. **Gamificación**: Los usuarios pueden marcar sus ejercicios favoritos
2. **Métricas sociales**: Ver cuánta gente ha resuelto cada ejercicio
3. **Progreso personal**: Identificar fácilmente qué ejercicios ya resolviste
4. **Motivación**: Ver que otros completaron ejercicios difíciles motiva a intentarlos
5. **Feedback**: Las estrellas sirven como indicador de calidad del ejercicio

## 🚀 Próximas Mejoras Posibles

- [ ] Sistema de comentarios en ejercicios
- [ ] Ranking de usuarios por ejercicios completados
- [ ] Insignias por logros (todos los fáciles, etc.)
- [ ] Compartir ejercicios favoritos
- [ ] Notificaciones cuando alguien da estrella a tu ejercicio
- [ ] Estadísticas de tiempo promedio de resolución
- [ ] Filtrar por ejercicios más populares (más estrellas)

## 🧪 Cómo Probar

1. **Iniciar servicios:**
   ```bash
   docker-compose up -d
   cd back && npm start
   cd front && npm run dev
   ```

2. **Probar estrellas:**
   - Ir a /principal
   - Click en la estrella de un ejercicio
   - Verificar que cambia de vacía a llena
   - Verificar que el contador incrementa

3. **Probar completados:**
   - Resolver un ejercicio correctamente
   - Volver a /principal
   - Verificar borde verde en el ejercicio resuelto

4. **Probar filtros:**
   - Usar filtro "Resueltos"
   - Solo debe mostrar ejercicios con borde verde

## 📊 Base de Datos

### Tabla Utilizada: `Estrellas`
```sql
CREATE TABLE Estrellas(
    ID SERIAL PRIMARY KEY,
    ID_Usuario INT NOT NULL,
    ID_Ejercicio INT NOT NULL,
    Fecha_Hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID) ON DELETE CASCADE,
    FOREIGN KEY (ID_Ejercicio) REFERENCES Ejercicios(ID) ON DELETE CASCADE
);
```

**Restricciones Recomendadas** (agregar si no existe):
```sql
ALTER TABLE Estrellas 
ADD CONSTRAINT unique_user_exercise 
UNIQUE (ID_Usuario, ID_Ejercicio);
```
Esto evita que un usuario dé múltiples estrellas al mismo ejercicio.
