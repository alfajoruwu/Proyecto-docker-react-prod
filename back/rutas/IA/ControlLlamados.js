class Peticion {
    constructor(ModeloIA, IDUsuario, Prompt) {
        this.ID = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        this.ListaA = false;
        this.ListaB = false;

        // Datos de la petición
        this.ModeloIA = ModeloIA;
        this.IDUsuario = IDUsuario;
        this.Prompt = Prompt;
        this.Respuesta = null;
        this.TiempoRespuesta = null;
        this.TiempoPeticion = Date.now();
        this.TiempoLimite = null;
    }

    ListaACorrecto() {
        this.ListaA = true;
    }

    ListaBCorrecto() {
        this.ListaB = true;
    }

}


class ControlLlamados {
    constructor() {
        // ------- Variables --------

        this.tiempoTemporizador1 = 10;
        this.tiempoTemporizador2 = 60;

        this.maxListaTemporizador1 = 10;
        this.maxListaTemporizador2 = 20;

        // 24 horas en segundos
        this.contadorLimite = 86400;

        this.limiteDiario = 50;

        // ------- Inicialización ------

        // Contadores de llamadas
        this.contadorLlamados = 0;

        // Listas temporales
        this.listaTemporizador1 = [];
        this.listaTemporizador2 = [];

        // Cola de peticiones
        this.colaPeticiones = [];

        // Temporizador activos
        this.Temporizador1Activo = false
        this.Temporizador2Activo = false
    }


    // ----------- Funciones principales -------------------

    CrearNuevaPeticion(ModeloIA, IDUsuario, Prompt) {

        // Crear peticion
        const peticion = new Peticion(ModeloIA, IDUsuario, Prompt);

        // verifica lista largo de cola
        console.log("cola largo actual", this.colaPeticiones.length);

        // iniciar temporizador de 24 horas
        if (this.contadorLlamados == 0) {
            // inicia temporizador
            const temporizador24h = setTimeout(() => {
                this.contadorLlamados = 0;
            }, this.contadorLimite * 1000);
        }
        // sumar contador
        this.contadorLlamados++;

        // Verificar si se ha alcanzado el limite diario
        if (this.contadorLlamados > this.limiteDiario) {
            console.log("Se ha alcanzado el limite diario de peticiones");
            return false;
        }

        // Añadir a la cola de peticiones
        this.colaPeticiones.push(peticion);

        // Crear temporizador 1 si no existe
        if (this.Temporizador1Activo == false) {
            this.Temporizador1Activo = true
            const temporizador1 = setTimeout(() => {
                this.LimpiarLista10segundos()
            }, this.tiempoTemporizador1 * 1000);
        }

        // Crear termporizador 2 si no existe
        if (this.Temporizador2Activo == false) {
            this.Temporizador2Activo = true
            const temporizador2 = setTimeout(() => {
                this.LimpiarLista60segundos()
            }, this.tiempoTemporizador2 * 1000);
        }


        // Primero verificar la disponibilidad de lista B
        if (this.listaTemporizador2.length < this.maxListaTemporizador2) {
            // Si hay espacio en la lista B
            this.listaTemporizador2.push(peticion);
            peticion.ListaBCorrecto();

            // También verificar lista A
            if (this.listaTemporizador1.length < this.maxListaTemporizador1) {
                this.listaTemporizador1.push(peticion);
                peticion.ListaACorrecto();
            }

            // Eliminar de la cola porque ya está en lista B
            this.colaPeticiones = this.colaPeticiones.filter(p => p.ID !== peticion.ID);
        } else {
            // Lista B llena, mantener solo en cola de peticiones
            // No hacer nada con lista A
        }

        // Return the created petition so it can be used in recibirPeticion
        return peticion;
    }



    // ----------  Funciones auxiliares --------------
    LimpiarLista10segundos() {
        // Borrar temporizador 1
        this.Temporizador1Activo = false
        // Limpiar lista
        this.listaTemporizador1 = [];

        // Recorrer lista temporizador 2
        this.listaTemporizador2.forEach((peticion) => {
            // Si la peticion no ha sido procesada
            if (peticion.ListaA == false) {
                // Añadir a lista 1
                this.listaTemporizador1.push(peticion);
                peticion.ListaACorrecto();
            }
        });


    }

    LimpiarLista60segundos() {
        // Borrar temporizador 2
        this.Temporizador2Activo = false
        // eliminar solo las peticiones que han sido procesadas en la lista A  
        this.listaTemporizador2 = this.listaTemporizador2.filter(peticion => peticion.ListaA == false);

        // si lista temporizador 2 tiene espacio, añade elementos de la cola a la lista B
        if (this.listaTemporizador2.length < this.maxListaTemporizador2) {
            // Añadir elementos de la cola a la lista B
            while (this.listaTemporizador2.length < this.maxListaTemporizador2 && this.colaPeticiones.length > 0) {
                const peticion = this.colaPeticiones.shift();
                this.listaTemporizador2.push(peticion);
                peticion.ListaBCorrecto();
            }
        }

    }

    /**
     * Recibe una función de petición y la ejecuta respetando los límites
     * @param {Function} funcionPeticion - Función que realiza la petición a la API
     * @param {string} modeloIA - Modelo de IA a utilizar
     * @param {string} idUsuario - Identificador del usuario
     * @param {string} prompt - Texto de la petición
     * @returns {Promise<any>} - Resultado de la petición o estado de cola
     */
    recibirPeticion(funcionPeticion, modeloIA = 'default', idUsuario = 'sistema', prompt = '') {
        return new Promise((resolve, reject) => {
            // Crear la petición y verificar disponibilidad
            const peticion = this.CrearNuevaPeticion(modeloIA, idUsuario, prompt);

            // Si se alcanzó el límite diario
            if (peticion === false) {
                return reject(new Error('Se ha alcanzado el límite diario de peticiones'));
            }

            // Verificar si la petición está en la lista B (disponible para procesar)
            const enListaB = this.listaTemporizador2.find(p => p.ID === peticion.ID);

            if (!enListaB) {
                // La petición está en cola, no en lista B
                return resolve({
                    enCola: true,
                    mensaje: 'Petición en cola, espere por favor',
                    posicion: this.colaPeticiones.findIndex(p => p.ID === peticion.ID) + 1
                });
            }

            // Si llegamos aquí, la petición puede procesarse
            try {
                // Ejecutar la función de petición y resolver la promesa
                Promise.resolve(funcionPeticion())
                    .then(resultado => {
                        resolve(resultado);
                    })
                    .catch(error => {
                        reject(error);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Obtiene el estado actual del controlador
     * @returns {Object} Estado del controlador
     */
    obtenerEstado() {
        return {
            temporizador1: {
                tiempoSegundos: this.tiempoTemporizador1,
                peticionesActuales: this.listaTemporizador1.length,
                capacidadMaxima: this.maxListaTemporizador1
            },
            temporizador2: {
                tiempoSegundos: this.tiempoTemporizador2,
                peticionesActuales: this.listaTemporizador2.length,
                capacidadMaxima: this.maxListaTemporizador2
            },
            colaPeticiones: this.colaPeticiones.length,
            limiteDiario: {
                total: this.limiteDiario,
                usados: this.contadorLlamados
            }
        };
    }
}

module.exports = ControlLlamados;
