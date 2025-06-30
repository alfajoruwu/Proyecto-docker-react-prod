const axios = require('axios');
require('dotenv').config({ path: '.env.development' });
const ControlLlamados = require('./ControlLlamados');

// Instanciar el controlador de llamadas
const controlador = new ControlLlamados();

// Flag para desactivar las llamadas a OpenRouter
const DISABLE_OPENROUTER = process.env.DISABLE_OPENROUTER === 'true';

// Configuración para la conexión a OpenRouter
const config = {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'
};

// Comprobación de configuración
if (!config.apiKey && !DISABLE_OPENROUTER) {
    console.warn('No se ha especificado OPENROUTER_API_KEY en las variables de entorno');
}

if (DISABLE_OPENROUTER) {
    console.log('⚠️ MODO OFFLINE: Las llamadas a OpenRouter están desactivadas. Se utilizarán respuestas simuladas.');
}

/**
 * Genera una respuesta simulada cuando OpenRouter está desactivado
 * @param {string} prompt - El prompt original
 * @param {string} modelo - El modelo solicitado
 * @returns {Object} - Una respuesta simulada
 */
function generarRespuestaSimulada(prompt, modelo) {
    const ahora = Math.floor(Date.now() / 1000);
    const respuestaTexto = `[RESPUESTA SIMULADA] Esta es una respuesta simulada para el prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}" utilizando el modelo ${modelo}`;

    return {
        id: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        model: modelo,
        created: ahora,
        choices: [
            {
                message: {
                    role: "assistant",
                    content: respuestaTexto
                },
                index: 0,
                finish_reason: "stop"
            }
        ],
        usage: {
            prompt_tokens: prompt.length,
            completion_tokens: respuestaTexto.length,
            total_tokens: prompt.length + respuestaTexto.length
        },
        simulado: true
    };
}

/**
 * Envía un mensaje al modelo de IA a través de OpenRouter
 * @param {string} prompt - El texto a enviar
 * @param {string} modelo - El modelo de IA a utilizar
 * @param {object} opciones - Opciones adicionales para la petición
 * @param {string} idUsuario - Identificador del usuario
 * @returns {Promise<object>} - La respuesta del modelo
 */
async function enviar(prompt, modelo = 'meta-llama/llama-3.1-8b-instruct:free', opciones = {}, idUsuario = 'sistema') {
    const funcionPeticion = async () => {
        // Si OpenRouter está desactivado, devolver una respuesta simulada
        if (DISABLE_OPENROUTER) {
            console.log(`Simulando respuesta para modelo: ${modelo}`);
            // Simular un retraso para que parezca real
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
            return generarRespuestaSimulada(prompt, modelo);
        }

        const url = `${config.baseURL}`;
        const datos = {
            model: modelo,
            messages: [
                { role: 'user', content: prompt }
            ],
            ...opciones
        };
        const respuesta = await axios.post(url, datos, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'HTTP-Referer': 'https://sqlfacilito.com',
                'X-Title': 'SQLFacilito'
            },
            timeout: 100000 // Timeout de 10 segundos
        });

        return respuesta.data;
    };

    return controlador.recibirPeticion(funcionPeticion, modelo, idUsuario, prompt);
}

/**
 * Envía un mensaje al modelo y devuelve la respuesta como stream
 * @param {string} prompt - El texto a enviar
 * @param {string} modelo - El modelo de IA a utilizar
 * @param {object} opciones - Opciones adicionales para la petición
 * @param {function} callbackChunk - Función que se llama con cada fragmento de respuesta
 * @returns {Promise<void>}
 */
async function enviarStream(prompt, modelo = 'meta-llama/llama-3.1-8b-instruct:free', opciones = {}, idUsuario = 'sistema') {
    const funcionPeticion = async () => {
        const url = `${config.baseURL}`;
        const datos = {
            model: modelo,
            messages: [
                { role: 'user', content: prompt }
            ],
            stream: true,
            ...opciones
        };

        const respuesta = await axios({
            method: 'post',
            url: url,
            data: datos,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'HTTP-Referer': 'https://sqlfacilito.com',
                'X-Title': 'SQLFacilito'
            },
            responseType: 'stream'
        });

        return respuesta.data;
    };

    return controlador.recibirPeticion(funcionPeticion, modelo, idUsuario, prompt);
}

/**
 * Obtiene información sobre el estado y límites del API key de OpenRouter
 * @returns {Promise<object>} - Información sobre el API key
 */
async function obtenerEstadoApiKey() {
    try {
        // Si OpenRouter está desactivado, devolver un estado simulado
        if (DISABLE_OPENROUTER) {
            console.log('Simulando estado del API key (modo offline)');
            return {
                simulado: true,
                data: {
                    label: "API Key Simulada",
                    usage: 0,
                    limit: 100,
                    limit_remaining: 100,
                    is_free_tier: true,
                    is_provisioning_key: false,
                    rate_limit: {
                        requests: 10,
                        interval: "10s"
                    }
                }
            };
        }

        const url = 'https://openrouter.ai/api/v1/auth/key';
        console.log('Consultando estado del API key en:', url);

        const respuesta = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'HTTP-Referer': 'https://sqlfacilito.com',
                'X-Title': 'SQLFacilito'
            },
            timeout: 20000
        });

        console.log('Respuesta del estado API (status):', respuesta.status);
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener información del API key:', error.message);
        if (error.response) {
            console.error('Detalles de respuesta de error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        }
        throw error;
    }
}

module.exports = {
    enviar,
    enviarStream,
    obtenerEstadoApiKey,
    controlador,
    DISABLE_OPENROUTER // Exportar la variable para que sea accesible desde otras partes
};