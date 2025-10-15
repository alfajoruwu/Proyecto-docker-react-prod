# Funcionalidad: Mi Perfil de Usuario

## 📝 Descripción
Se ha agregado una nueva sección de **"Mi Perfil"** donde los usuarios pueden ver estadísticas completas sobre su comportamiento y progreso en la plataforma.

## 🎯 Características Implementadas

### Backend - Endpoints (3 nuevas rutas)

#### 1. `GET /usuarios/estadisticas`
Obtiene estadísticas completas del usuario autenticado:

**Datos devueltos:**
- **Información del usuario**: nombre, email, rol, fecha de registro, días activo
- **Resumen general**:
  - Ejercicios resueltos
  - Total de intentos (correctos e incorrectos)
  - Consultas a la IA
  - Ejecuciones SQL
  - Estrellas dadas
  - Días activos en la semana
  - Ejercicios resueltos al primer intento
- **Ejercicios por dificultad**: Progreso en cada nivel
- **Uso de IA**: Consultas de revisión y guía
- **Actividad reciente**: Últimos 30 días de actividad
- **Tópicos más practicados**: Top 10 de temas
- **Tiempo promedio de resolución**
- **Tasa de éxito**: Porcentaje de intentos correctos

#### 2. `GET /usuarios/historial-intentos?limite=10`
Obtiene el historial de intentos recientes del usuario:
- SQL ejecutado
- Si fue correcto o no
- Nombre del ejercicio
- Dificultad
- Fecha y hora

#### 3. `GET /usuarios/logros`
Sistema de logros/achievements:

**Logros implementados:**
- 🏆 **Primera Victoria**: Resolver el primer ejercicio
- 🔥 **Persistente**: Activo 7 días en una semana
- 📚 **Aprendiz**: Resolver 10 ejercicios
- 💪 **Autodidacta**: Resolver 5 ejercicios sin ayuda de IA
- ⭐ **Perfeccionista**: Resolver 3 ejercicios al primer intento

Cada logro muestra:
- Progreso actual vs objetivo
- Estado (desbloqueado o bloqueado)
- Fecha de desbloqueo (si aplica)

### Frontend - Vista de Perfil

#### Componente: `MiPerfil.jsx`
Ubicación: `/front/src/Vistas/Perfil/MiPerfil.jsx`

**Secciones visuales:**

1. **Encabezado del perfil**
   - Avatar con inicial del nombre
   - Información básica del usuario
   - Badges de rol y antigüedad

2. **Estadísticas principales** (4 cards grandes)
   - Ejercicios resueltos
   - Total de intentos con tasa de éxito
   - Consultas a la IA
   - Ejecuciones SQL

3. **Progreso por dificultad**
   - Barras de progreso por cada nivel
   - Contador de ejercicios intentados vs resueltos
   - Códigos de color por dificultad

4. **Uso de Inteligencia Artificial**
   - Total de consultas
   - Ejercicios con ayuda
   - Desglose: Revisiones vs Guías

5. **Tópicos más practicados**
   - Grid con cards de cada tópico
   - Progreso visual con barras
   - Ejercicios intentados y resueltos

6. **Sistema de logros**
   - Cards interactivas para cada logro
   - Efecto visual para logros desbloqueados
   - Progreso en tiempo real
   - Contador de logros totales

7. **Estadísticas adicionales**
   - Racha de días activos
   - Ejercicios resueltos al primer intento
   - Tiempo promedio de resolución

#### Estilos: `MiPerfil.css`
- Diseño responsivo (móvil, tablet, desktop)
- Animaciones suaves de entrada
- Efectos hover en cards
- Animación shimmer en logros desbloqueados
- Gradientes en números y avatares
- Transiciones suaves

### Navegación

#### Acceso a la vista:
1. **Menú del usuario** (arriba a la derecha)
   - Click en el icono de usuario
   - Opción "Mi Perfil"

2. **Menú lateral** (hamburguesa)
   - Opción "Mi Perfil" directamente visible

#### Ruta: `/mi-perfil`

## 🛠️ Archivos Modificados/Creados

### Backend:
- ✅ **Creado**: `/back/rutas/Usuario/Perfil.js` (495 líneas)
- ✅ **Modificado**: `/back/app.js` (registro de rutas)

### Frontend:
- ✅ **Creado**: `/front/src/Vistas/Perfil/MiPerfil.jsx` (425 líneas)
- ✅ **Creado**: `/front/src/Vistas/Perfil/MiPerfil.css` (115 líneas)
- ✅ **Modificado**: `/front/src/App.jsx` (nueva ruta)
- ✅ **Modificado**: `/front/src/Componentes/Navbar.jsx` (enlaces agregados)

## 📊 Datos Analizados

La funcionalidad analiza datos de las siguientes tablas:
- `Usuarios`
- `Ejercicios`
- `Intentos`
- `AyudaIA`
- `EjecucionesSQL`
- `IniciosEjercicio`
- `Estrellas`

## 🔐 Seguridad

- Todos los endpoints están protegidos con `authMiddleware`
- Requieren rol mínimo de "usuario"
- Solo se muestran los datos del usuario autenticado
- Validación de token en el frontend

## 🎨 Diseño

- Utiliza DaisyUI para componentes
- Diseño consistente con el resto de la aplicación
- Sistema de temas compatible (claro/oscuro)
- Responsive design para todos los dispositivos
- Animaciones suaves y profesionales

## 🚀 Cómo probar

1. **Iniciar el backend:**
   ```bash
   cd back
   npm start
   ```

2. **Iniciar el frontend:**
   ```bash
   cd front
   npm run dev
   ```

3. **Navegar a la aplicación:**
   - Iniciar sesión con un usuario existente
   - Click en el icono de usuario (arriba derecha)
   - Seleccionar "Mi Perfil"

4. **Datos de prueba:**
   - La vista funciona mejor con usuarios que ya tengan actividad
   - Si es un usuario nuevo, mostrará valores en 0
   - Resolver algunos ejercicios para ver estadísticas

## 📈 Métricas Calculadas

- **Tasa de éxito**: (Intentos correctos / Total intentos) × 100
- **Progreso por dificultad**: (Resueltos / Intentados) por nivel
- **Racha activa**: Días únicos con actividad en los últimos 7 días
- **Tiempo promedio**: Promedio de minutos entre inicio y resolución
- **Tópicos**: Análisis de arrays de PostgreSQL con UNNEST

## 🔄 Actualizaciones en tiempo real

- Los datos se cargan al entrar a la vista
- No hay polling automático
- El usuario puede refrescar la página para ver datos actualizados
- (Posible mejora futura: WebSockets para actualizaciones en vivo)

## ✨ Características destacadas

1. **Sistema de logros gamificado** con progreso visual
2. **Estadísticas completas** de todas las actividades
3. **Diseño atractivo** con gradientes y animaciones
4. **Responsive** para todos los dispositivos
5. **Integración completa** con el sistema existente
6. **Performance optimizado** con consultas SQL eficientes

## 🎯 Posibles mejoras futuras

- Gráficos interactivos con Chart.js o Recharts
- Comparación con otros usuarios (ranking)
- Exportar estadísticas a PDF
- Más logros personalizables
- Historial de progreso temporal (gráfico de línea)
- Predicciones con IA sobre próximos tópicos a practicar
- Badges compartibles en redes sociales
- Sistema de niveles/experiencia (XP)
