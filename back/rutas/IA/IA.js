const express = require('express');
const router = express.Router();
const { enviar, enviarStream, obtenerEstadoApiKey, controlador } = require('./AuxIA');
const pool = require('../../config/DB');
const { authMiddleware, Verifica } = require('../../middleware/TipoUsuario.js');

// Variable global que se puede modificar en tiempo de ejecución
let offlineMode = process.env.DISABLE_OPENROUTER === 'true';

// Endpoint regular para consultas (respuesta completa)
router.post('/ejemplo-consulta', async (req, res) => {
    try {
        const { consulta } = req.body;

        if (!consulta) {
            return res.status(400).json({ error: 'La consulta es obligatoria' });
        }

        const prompt = `"${consulta}"`;
        const resultado = await enviar(prompt);

        // Verificar si la petición está en cola
        if (resultado.enCola) {
            return res.status(202).json({
                enCola: true,
                mensaje: resultado.message,
                posicion: resultado.posicion
            });
        }

        res.status(200).json({
            respuesta: resultado.choices[0].message.content.trim(),
            metadata: {
                caracteres: resultado.choices[0].message.content.length,
                modelo: resultado.model,
                tiempo_respuesta: resultado.created ? new Date(resultado.created * 1000) : new Date()
            }
        });
    } catch (error) {
        console.error('Error en el ejemplo de consulta a IA:', error);

        if (error.message.includes('límite diario')) {
            return res.status(429).json({ error: 'Se ha alcanzado el límite diario de peticiones' });
        }

        res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud de ejemplo' });
    }
});

router.post('/PromptA', authMiddleware, Verifica("usuario"), async (req, res) => {
    try {

        const { contexto, problema, respuesta, ejercicioId } = req.body;

        const Modelo = "deepseek/deepseek-chat-v3-0324:free"

        const Prompt = `

<ROL>
Tu tarea es revisar las respuestas de estudiantes de bases de datos, estos practican el lenguaje SQL. tienes el contexto de la base de datos, el problema y la respuesta del estudiante. tienes que revisar si la respuesta es incorrecta o correcta, si es incorrecta tienes que identificar los errores.
</ROL>

<Contexto>
Al evaluar consultas SQL, clasifica los posibles resultados en las siguientes categorías:

1. **Respuesta Correcta**
   - Descripción: La consulta cumple con el objetivo solicitado.
   - Resultado: Genera la tabla esperada y con datos correctos.
   - Mensaje estándar: "✅ No hay error encontrado."

2. **Error de Sintaxis**
   - Descripción: La consulta no se ejecuta correctamente debido a errores en la escritura (palabras clave mal escritas, falta de comas, puntos y comas innecesarios, uso incorrecto de paréntesis, etc.).
   - Efecto: No genera ninguna tabla de resultados.
   - Ejemplo: "SELEC name FROM users" (error en "SELEC").

3. **Error Lógico**
   - Descripción: La consulta se ejecuta sin errores de sintaxis, pero devuelve datos incorrectos o no resuelve el problema planteado.
   - Efecto: Genera una tabla, pero con resultados erróneos.
   - Ejemplo: Usar ">" en lugar de "<" al filtrar salarios bajos.

4. **Uso de Elementos Adicionales**
   - Descripción: La consulta es funcional y devuelve los datos correctos, pero incluye pasos, funciones o tablas innecesarias que no eran parte del requerimiento original.
   - Efecto: Aunque el resultado es correcto, la solución no es óptima ni precisa.
   - Ejemplo: Usar "ORDER BY" cuando no se pide ordenar, o realizar "JOIN" con tablas irrelevantes.
   - NOTA IMPORTANTE: No fijarse en formas alternativas de llegar al mismo resultado. (formas implicitas o explicitas no son errores)

> Nota: Una consulta puede contener **más de un tipo de error**. Evalúa cuidadosamente cada parte de la consulta antes de emitir el diagnóstico final.
</Contexto>

<Formato>
Problema: [Breve descripción del objetivo]
Consulta del estudiante:
SELECT ...

Tienes que responder en el formato de:
Errores identificados:
    [Tipo de error]: [Breve descripción del error]
        ¿Por qué es un error? [Explicación educativa]
        Solución: [Consulta corregida]
</Formato>

<Ejemplos>

<Base de ejemplo>
CREATE TABLE autores (
    autor_id INT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE libros (
    libro_id INT PRIMARY KEY,
    titulo VARCHAR(200),
    autor_id INT,
    genero VARCHAR(50),
    FOREIGN KEY (autor_id) REFERENCES autores(autor_id)
);

CREATE TABLE ventas (
    venta_id INT PRIMARY KEY,
    libro_id INT,
    cantidad INT,
    fecha_venta DATE,
    FOREIGN KEY (libro_id) REFERENCES libros(libro_id)
);

INSERT INTO autores VALUES
(1, 'Gabriel García Márquez'),
(2, 'Isabel Allende'),
(3, 'Stephen King');

INSERT INTO libros VALUES
(1, 'Cien años de soledad', 1, 'Realismo Mágico'),
(2, 'La casa de los espíritus', 2, 'Realismo Mágico'),
(3, 'It', 3, 'Terror'),
(4, 'El rey pálido', 3, 'Ficción');

INSERT INTO ventas VALUES
(1, 1, 5, '2023-10-01'),
(2, 2, 3, '2023-10-01'),
(3, 3, 10, '2023-10-02'),
(4, 1, 2, '2023-10-03'),
(5, 4, 7, '2023-10-03');
</base de ejemplo>

<Ejemplo1>
Listar el total de ventas por autor, incluyendo solo aquellos autores cuyo género principal sea "Realismo Mágico".

Consulta del estudiante:
SELECT a.nombre, SUM(v.cantidad) AS total_ventas
FROM autores a
JOIN libros l ON a.autor_id = l.autor_id
JOIN ventas v ON l.libro_id = v.libro_id
WHERE l.genero = 'Realismo Mágico'
GROUP BY a.autor_id;

Errores identificados:
1. Sintaxis: Falta incluir a.nombre en GROUP BY.
   - ¿Por qué es un error? Todos los campos no agregados en SELECT deben estar en GROUP BY.
   - Solución:
     GROUP BY a.autor_id, a.nombre;

Tabla esperada
| nombre                  | total_ventas |
|-------------------------|--------------|
| Gabriel García Márquez  | 7            |
| Isabel Allende          | 3            |


Tabla obtenida
Error de sintaxis (no genera tabla):
</Ejemplo1>

<Ejemplo2>
Listar el total de ventas por autor para libros del género "Realismo Mágico", incluyendo solo autores con más de 5 ventas totales.

Consulta del estudiante:
SELECT a.autor_id, SUM(v.cantidad) AS total_ventas
FROM autores a
JOIN libros l ON a.autor_id = l.autor_id
JOIN ventas v ON l.libro_id = v.libro_id
WHERE l.genero = 'Realismo Mágico' AND SUM(v.cantidad) < 5
GROUP BY a.autor_id;

Errores identificados:
1 logico: Uso incorrecto de operador mayor que.
   - ¿Por que es un error? Esta realizando la comparacion mal.
   - Solucion: cambiar < por >

2. Sintaxis: Uso incorrecto de SUM en WHERE.
   - ¿Por qué es un error? WHERE se evalúa antes de agrupar, por lo que SUM no existe en esa etapa.
   - Solución:
     HAVING SUM(v.cantidad) > 5

3. Lógico: a.autor_id en SELECT sin claridad para el estudiante.
   - Solución:
     SELECT a.nombre, SUM(v.cantidad) AS total_ventas

Tabla esperada:
| nombre                  | total_ventas |
|-------------------------|--------------|
| Gabriel García Márquez  | 7            |

Tabla generada por el estudiante:
Error de sintaxis (no genera tabla):

</Ejemplo2>


<Ejemplo3>
Contar ventas por autor en "Realismo Mágico".

Consulta del estudiante:
SELECT a.nombre, COUNT(v.venta_id)
FROM autores a
JOIN libros l ON a.autor_id = l.autor_id
GROUP BY a.autor_id;

Errores identificados:
1. Lógico: Falta filtro por género.
   - ¿Por qué es un error? Incluye libros de otros géneros (ej: terror, ficción).
   - Solución:
     WHERE l.genero = 'Realismo Mágico'


2. Lógico: Falta a.nombre en GROUP BY.
   - ¿Por qué es un error? a.nombre no está en GROUP BY ni es función de agregación.
   - Solución:
     GROUP BY a.autor_id, a.nombre;

Tabla esperada:
| nombre                  | total_ventas |
|-------------------------|--------------|
| Gabriel García Márquez  | 2            |
| Isabel Allende          | 1            |

Tabla generada por el estudiante:
| nombre                  | COUNT(v.venta_id) |
|-------------------------|-------------------|
| Gabriel García Márquez  | 2                 |
| Isabel Allende          | 1                 |
| Stephen King            | 2                 |

</Ejemplo3>


<Ejemplo4>

Cuenta por autor todas las ventas de libros de realismo magico

Consulta del estudiante:
SELECT a.nombre, SUM(v.cantidad) AS total_ventas
FROM autores a
JOIN libros l ON a.autor_id = l.autor_id
JOIN ventas v ON l.libro_id = v.libro_id
WHERE l.genero = 'Realismo Mágico'
GROUP BY a.autor_id, a.nombre;

- No hay error encontrado.
  - Justificación: La consulta incluye filtros correctos y agrupa por todos los campos no agregados.

Tabla esperada:
| nombre                  | total_ventas |
|-------------------------|--------------|
| Gabriel García Márquez  | 7            |
| Isabel Allende          | 3            |

Tabla generada por el estudiante:
| nombre                  | total_ventas |
|-------------------------|--------------|
| Gabriel García Márquez  | 7            |
| Isabel Allende          | 3            |

</Ejemplo4>


<Ejemplo5>
Listar todos los autores con sus IDs y nombres

Consulta del estudiante:
SELECT a.autor_id, a.nombre
FROM autores a
JOIN libros l ON a.autor_id = l.autor_id;

1.- Elementos adicionales: Uso innecesario de JOIN con la tabla libros.
  -¿Por qué es un error?:  La tabla libros no es necesaria para obtener los campos solicitados (autor_id y nombre están en la tabla autores).

Tabla esperada:
| AUTOR_ID | Nombre                  |
|----------|-------------------------|
|  1       | Gabriel García Márquez  |
|  2       | Isabel Allende          |
|  3       | Stephen King            |

Tabla del estudiante

| AUTOR_ID | Nombre                  |
|----------|-------------------------|
|  1       | Gabriel García Márquez  |
|  2       | Isabel Allende          |
|  3       | Stephen King            |

</Ejemplo5>

<Consideraciones>
- No te fijes en el formato del texto entregado; asume que está organizado para la vista del estudiante.
- Respeta siempre el formato establecido.
- Habla únicamente en español.
- Sé conciso y claro: menos es más.
</Consideraciones>

Contexto de la base de datos:
${contexto}

Problema
${problema}

Respuesta estudiante
${respuesta}
`;

        const idUsuario = req.user?.id || 'anonimo';


        const resultado = await enviar(Prompt, Modelo, {}, idUsuario);

        // Verificar si la petición está en cola
        if (resultado.enCola) {
            return res.status(202).json({
                enCola: true,
                mensaje: resultado.message,
                posicion: resultado.posicion
            });
        }

        const respuestaIA = resultado.choices[0].message.content.trim();

        // Registrar la consulta IA en la base de datos
        try {
            const preguntaDatos = JSON.stringify({
                contexto: contexto,
                problema: problema,
                respuesta: respuesta
            });

            await pool.query(
                'INSERT INTO AyudaIA (ID_Usuario, ID_Ejercicio, Pregunta, Respuesta_IA, Tipo_Interaccion) VALUES ($1, $2, $3, $4, $5)',
                [req.user.id, ejercicioId || null, preguntaDatos, respuestaIA, 'PromptA']
            );
            console.log('✅ Consulta IA registrada exitosamente para PromptA');
        } catch (dbError) {
            console.error('❌ Error registrando consulta IA:', dbError.message);
            // No fallar la respuesta por error de registro
        }

        res.status(200).json({
            respuesta: respuestaIA,
            metadata: {
                caracteres: respuestaIA.length,
                modelo: resultado.model,
                tiempo_respuesta: resultado.created ? new Date(resultado.created * 1000) : new Date()
            }
        });
    } catch (error) {
        console.error('Error en consulta a IA con modelo específico:', error);

        if (error.message.includes('límite diario')) {
            return res.status(429).json({ error: 'Se ha alcanzado el límite diario de peticiones' });
        }

        res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud con el modelo especificado' });
    }
});


router.post('/PromptB', authMiddleware, Verifica("usuario"), async (req, res) => {
    try {

        const { contexto, problema, respuesta, ejercicioId } = req.body;

        const Modelo = "deepseek/deepseek-chat-v3-0324:free"

        const prompt = `
<ROL>
Eres un asistente especializado en enseñanza de SQL. Tu labor es guiar paso a paso a un estudiante en la resolución de ejercicios prácticos de consultas SQL.
</ROL>

<PASOS A SEGUIR>

1. **Entender el problema**
   - ¿Qué se pide en el ejercicio?
   - ¿Hay condiciones especiales? (ejemplo: sin duplicados, solo ciertos valores, ordenamiento, etc.)

2. **Identificar las tablas involucradas**
   - ¿Cuáles son las tablas necesarias para resolver el ejercicio?
   - ¿Qué columnas importantes tienen cada una de ellas?

3. **Definir las relaciones entre tablas**
   - ¿Cómo se conectan las tablas entre sí? (ejemplo: con JOINs, claves foráneas, etc.)
   - ¿Qué campos se usan para hacer estas uniones?

4. **Plan de acción**
   - ¿Qué funciones o cláusulas SQL se deben usar? (ejemplo: WHERE, GROUP BY, DISTINCT, JOIN, subconsultas)
   - ¿Qué pasos debe seguir el estudiante para construir la consulta?

5. **Construcción de la consulta paso a paso**
   - Explica cómo ir armando la consulta desde lo más básico hasta la solución final.
   - Justifica cada parte de la consulta.

6. **Consulta final**
   - Muestra la consulta completa con comentarios si es necesario.
   - Explica qué hace cada parte de forma breve.

7. **Resultado esperado**
   - Muestra un ejemplo del resultado final que debería obtenerse (en forma de tabla).
   - Si aplica, menciona cuántas filas o qué tipo de datos deberían aparecer.

</PASOS A SEGUIR>
Contexto de la base de datos:
${contexto}

Problema
${problema}

Respuesta estudiante
${respuesta} 
`


        const idUsuario = req.user?.id || 'anonimo';


        const resultado = await enviar(prompt, Modelo, {}, idUsuario);

        // Verificar si la petición está en cola
        if (resultado.enCola) {
            return res.status(202).json({
                enCola: true,
                mensaje: resultado.message,
                posicion: resultado.posicion
            });
        }

        const respuestaIA = resultado.choices[0].message.content.trim();

        // Registrar la consulta IA en la base de datos
        try {
            const preguntaDatos = JSON.stringify({
                contexto: contexto,
                problema: problema,
                respuesta: respuesta
            });

            await pool.query(
                'INSERT INTO AyudaIA (ID_Usuario, ID_Ejercicio, Pregunta, Respuesta_IA, Tipo_Interaccion) VALUES ($1, $2, $3, $4, $5)',
                [req.user.id, ejercicioId || null, preguntaDatos, respuestaIA, 'PromptB']
            );
            console.log('✅ Consulta IA registrada exitosamente para PromptB');
        } catch (dbError) {
            console.error('❌ Error registrando consulta IA:', dbError.message);
            // No fallar la respuesta por error de registro
        }

        res.status(200).json({
            respuesta: respuestaIA,
            metadata: {
                caracteres: respuestaIA.length,
                modelo: resultado.model,
                tiempo_respuesta: resultado.created ? new Date(resultado.created * 1000) : new Date()
            }
        });
    } catch (error) {
        console.error('Error en consulta a IA con modelo específico:', error);

        if (error.message.includes('límite diario')) {
            return res.status(429).json({ error: 'Se ha alcanzado el límite diario de peticiones' });
        }

        res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud con el modelo especificado' });
    }
});



// Endpoint para consultas con selección de modelo
router.post('/modelo-consulta', async (req, res) => {
    try {
        const { consulta, modelo } = req.body;
        const idUsuario = req.user?.id || 'anonimo';

        if (!consulta) {
            return res.status(400).json({ error: 'La consulta es obligatoria' });
        }

        if (!modelo) {
            return res.status(400).json({ error: 'El modelo es obligatorio' });
        }

        const prompt = `"${consulta}"`;
        const resultado = await enviar(prompt, modelo, {}, idUsuario);

        // Verificar si la petición está en cola
        if (resultado.enCola) {
            return res.status(202).json({
                enCola: true,
                mensaje: resultado.message,
                posicion: resultado.posicion
            });
        }

        res.status(200).json({
            respuesta: resultado.choices[0].message.content.trim(),
            metadata: {
                caracteres: resultado.choices[0].message.content.length,
                modelo: resultado.model,
                tiempo_respuesta: resultado.created ? new Date(resultado.created * 1000) : new Date()
            }
        });
    } catch (error) {
        console.error('Error en consulta a IA con modelo específico:', error);

        if (error.message.includes('límite diario')) {
            return res.status(429).json({ error: 'Se ha alcanzado el límite diario de peticiones' });
        }

        res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud con el modelo especificado' });
    }
});

// Nuevo endpoint con streaming carácter por carácter
router.post('/streaming-consulta', async (req, res) => {
    try {
        const { consulta } = req.body;
        const idUsuario = req.user?.id || 'anonimo';

        if (!consulta) {
            return res.status(400).json({ error: 'La consulta es obligatoria' });
        }

        // Configurar cabeceras para SSE (Server-Sent Events)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const prompt = `"${consulta}"`;
        const resultado = await enviarStream(prompt, 'meta-llama/llama-3.1-8b-instruct:free', {}, idUsuario);

        // Verificar si la petición está en cola
        if (resultado.enCola) {
            res.write(`data: ${JSON.stringify({
                tipo: 'cola',
                mensaje: resultado.message,
                posicion: resultado.posicion
            })}\n\n`);
            return res.end();
        }

        // Obtuvimos el stream, procesarlo
        const stream = resultado;

        let respuestaCompleta = '';
        let contador = 0;
        let buffer = '';

        // Manejar los eventos del stream
        stream.on('data', (chunk) => {
            // Añadir el chunk al buffer
            buffer += chunk.toString();

            // Procesar todos los eventos completos en el buffer
            let delimiterIndex;
            while ((delimiterIndex = buffer.indexOf('\n\n')) !== -1) {
                // Extraer la línea del evento
                const line = buffer.substring(0, delimiterIndex);
                // Eliminar la línea procesada del buffer
                buffer = buffer.substring(delimiterIndex + 2);

                // Procesar solo las líneas que comienzan con 'data: '
                if (line.startsWith('data: ')) {
                    const data = line.substring(6); // remover 'data: '

                    // Verificar si es el mensaje de fin
                    if (data === '[DONE]') {
                        res.write(`data: ${JSON.stringify({
                            tipo: 'fin',
                            metadata: {
                                caracteres_totales: respuestaCompleta.length
                            }
                        })}\n\n`);
                        continue;
                    }

                    try {
                        const json = JSON.parse(data);
                        const delta = json.choices?.[0]?.delta?.content || '';

                        if (delta) {
                            // Acumular la respuesta completa
                            respuestaCompleta += delta;

                            // Enviar cada fragmento como un evento
                            res.write(`data: ${JSON.stringify({
                                tipo: 'caracter',
                                contenido: delta,
                                contador: ++contador
                            })}\n\n`);
                        }
                    } catch (err) {
                        console.error('Error procesando JSON:', err, 'Data:', data);
                    }
                }
            }
        });

        stream.on('end', () => {
            res.end();
        });

        stream.on('error', (err) => {
            console.error('Error en el stream:', err);
            res.write(`data: ${JSON.stringify({ error: 'Error en el stream' })}\n\n`);
            res.end();
        });

        // Si el cliente cierra la conexión
        req.on('close', () => {
            stream.destroy();
        });
    } catch (error) {
        console.error('Error al iniciar stream con IA:', error);

        if (!res.headersSent) {
            if (error.message.includes('límite diario')) {
                return res.status(429).json({ error: 'Se ha alcanzado el límite diario de peticiones' });
            }
            res.status(500).json({ error: 'Ocurrió un error al iniciar el stream' });
        }
    }
});

// Endpoint para consultar estado del controlador
router.get('/estado-controlador', (req, res) => {
    res.status(200).json(controlador.obtenerEstado());
});

// Endpoint para consultar estado del API key
router.get('/estado-api-key', async (req, res) => {
    try {
        console.log('Iniciando consulta de estado API key');
        const estadoKey = await obtenerEstadoApiKey();
        console.log('Respuesta completa de API key:', JSON.stringify(estadoKey, null, 2));

        // Verificar la estructura de la respuesta confirmada
        if (!estadoKey || !estadoKey.data) {
            console.error('Estructura de respuesta inesperada:', estadoKey);
            return res.status(500).json({
                error: 'La respuesta del API no tiene el formato esperado',
                detalles: estadoKey
            });
        }

        // Formatear la respuesta con el formato confirmado
        const data = estadoKey.data;
        const respuesta = {
            label: data.label || 'Sin etiqueta',
            creditos: {
                usados: data.usage || 0,
                limite: data.limit === null ? 'Ilimitado' : data.limit,
                restante: data.limit_remaining === null ? 'Ilimitado' : data.limit_remaining,
                porcentajeUso: data.limit === null ? 0 : (data.usage / data.limit) * 100
            },
            esTierGratuito: data.is_free_tier || false,
            esClaveProvisionamiento: data.is_provisioning_key || false,
            limiteRitmo: {
                peticiones: data.rate_limit?.requests || 0,
                intervalo: data.rate_limit?.interval || 'N/A'
            },
            formatoEsperado: true,
            datosOriginales: estadoKey
        };

        res.status(200).json(respuesta);
    } catch (error) {
        console.error('Error al consultar estado del API key:', error);
        res.status(500).json({
            error: 'Ocurrió un error al consultar el estado del API key',
            mensaje: error.message,
            detalles: error.response?.data || 'Sin detalles adicionales'
        });
    }
});

// Endpoint para cambiar el modo offline dinámicamente
router.post('/toggle-offline-mode', (req, res) => {
    try {
        // Cambiar el modo offline si se proporciona un nuevo valor
        if (req.body.hasOwnProperty('offlineMode')) {
            offlineMode = !!req.body.offlineMode;
            console.log(`Modo offline cambiado a: ${offlineMode}`);
        }

        res.status(200).json({
            success: true,
            offlineMode
        });
    } catch (error) {
        console.error('Error al cambiar modo offline:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cambiar el modo offline'
        });
    }
});

// Endpoint para obtener el estado actual del modo offline
router.get('/offline-mode-status', (req, res) => {
    res.status(200).json({
        offlineMode
    });
});

module.exports = router;

