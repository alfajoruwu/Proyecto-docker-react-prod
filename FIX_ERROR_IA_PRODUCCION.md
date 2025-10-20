# Fix: Error IA en Producción

## Problema Identificado

La IA no funcionaba en producción, retornando el error:
```json
{"error":"Ocurrió un error al procesar la solicitud con el modelo especificado"}
```

## Causa Raíz

En el archivo `back/rutas/IA/AuxIA.js`, línea 2, se estaba cargando:

```javascript
require('dotenv').config({ path: '.env.development' });
```

Este archivo `.env.development` **no existe** en el proyecto. Solo existe `.env`, lo que causaba que:

1. Las variables de entorno (como `OPENROUTER_API_KEY`) no se cargaran correctamente
2. La API de OpenRouter fallaba por falta de autenticación
3. Se generaba el error genérico en el catch

## Solución Implementada

Se cambió a:

```javascript
require('dotenv').config(); // Carga .env automáticamente
```

Sin especificar `path`, `dotenv` busca automáticamente el archivo `.env` en el directorio raíz del proyecto.

## Cómo Probar

1. **Reconstruir la imagen de producción:**
   ```bash
   docker compose -f docker-compose.build.yml down -v
   docker compose -f docker-compose.build.yml up --build -d
   ```

2. **Probar un endpoint de IA:**
   - Ir a un ejercicio
   - Intentar usar la revisión con IA (PromptA)
   - Verificar que responda correctamente

## Variables de Entorno Importantes

Asegúrate de que estas variables estén definidas en `.env`:

- `OPENROUTER_API_KEY`: Tu API key de OpenRouter
- `OPENROUTER_API_URL`: URL de la API (https://openrouter.ai/api/v1/chat/completions)

## Modo Offline (Opcional)

Si quieres desactivar temporalmente las llamadas a OpenRouter:

```bash
DISABLE_OPENROUTER=true
```

Esto hará que se generen respuestas simuladas para desarrollo/testing.

## Fecha de Fix

14 de octubre de 2025

## Archivos Modificados

- `back/rutas/IA/AuxIA.js` - Línea 2
