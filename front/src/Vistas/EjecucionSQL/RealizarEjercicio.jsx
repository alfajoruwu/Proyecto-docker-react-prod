import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import './SQLEjecucion.css';
import CustomTable from '../../AuxS/CustomTable';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { FaDatabase, FaCode, FaPlay, FaCheckCircle, FaTimes, FaTable, FaRobot, FaEye, FaLightbulb, FaFile, FaHome } from 'react-icons/fa';

const RealizarEjercicio = ({ }) => {

    const handleCelebrate = () => {
        const end = Date.now() + 7 * 1000; // 15 segundos
        const colors = ['#bb0000', '#ffffff']; // Tus colores normales

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame(); // Iniciar animación
    };


    const Navigate = useNavigate();
    const { mostrarToast } = useToast();

    const { IdEjercicioResolver, SetIdEjercicioResolver, SetterIdEjercicioResolver } = useContext(EstadoGlobalContexto)

    const [ResumenEjercicio, SetResumenEjercicio] = useState('')
    const SetterResumenEjercicio = (event) => {
        SetResumenEjercicio(event.target.value)
    }

    const [ProblemaEjercicio, SetProblemaEjercicio] = useState('')
    const SetterProblemaEjercicio = (event) => {
        SetProblemaEjercicio(event.target.value)
    }
    const [IDDBSeleccionadaEjercicio, SetIDDBSeleccionadaEjercicio] = useState('')
    const SetterIDDBSeleccionadaEjercicio = (event) => {
        SetIDDBSeleccionadaEjercicio(event.target.value)
    }

    const [SolucionEjercicio, SetSolucionEjercicio] = useState('')
    const SetterSolucionEjercicio = (event) => {
        SetSolucionEjercicio(event.target.value)
    }

    const [TablaSolucionEjercicio, SetTablaSolucionEjercicio] = useState('')
    const SetterTablaSolucionEjercicio = (event) => {
        SetTablaSolucionEjercicio(event.target.value)
    }

    const EjecutarSQL = () => {
        console.log('Ejecutar SQL', SQLEjecutar);
        apiClient.post('/basedatos/EjecutarQuery', { dbId: IDDBSeleccionadaEjercicio, query: SQLEjecutar })
            .then(response => {
                console.log('SQL Ejecutado:', response);
                mostrarToast(response.data.message, 'success', 3000);
                SetTablasSQLResultado(response.data.filas);
                // Registrar ejecución exitosa
                apiClient.post('/ejericicios/RegistrarEjecucionSQL', { ejercicioId: IdEjercicioResolver, sqlQuery: SQLEjecutar, resultado: 'Exitoso' });
            })
            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                mostrarToast('SQL Error: ' + error.response.data.detalle, 'error', 3000);
                // Limpiar la tabla de resultados cuando hay error
                SetTablasSQLResultado('');
                // Registrar ejecución fallida
                apiClient.post('/ejericicios/RegistrarEjecucionSQL', { ejercicioId: IdEjercicioResolver, sqlQuery: SQLEjecutar, resultado: 'Error: ' + error.response.data.detalle });
            });

    }

    const manejarCambio = (event) => {
        const tablaSeleccionada = event.target.value;
        console.log('Tabla seleccionada:', tablaSeleccionada);
        apiClient.post('/basedatos/EjecutarQuery', { dbId: IDDBSeleccionadaEjercicio, query: 'select * from ' + tablaSeleccionada })
            .then(response => {
                console.log('SQL Ejecutado:', response);
                SetTablaInicial(response.data.filas)
            })
            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                mostrarToast(error.response.data.error, 'error', 3000);
            });
    }

    const IrCrearEjercicio = () => { Navigate('/principal') }

    const CancelarCreacionDERespuesta = () => {
        SetSQLEjecutar('');
        SetTablaInicial('');
        IrCrearEjercicio();

    }

    const AbrirPopUPCorrecto = () => {
        const dialog = document.getElementById('Respuesta_Correcta');
        dialog.showModal();
        handleCelebrate()
    }

    const CerrarPopUpCorrecto = () => {
        const dialog = document.getElementById('Respuesta_Correcta');
        dialog.close();
    }

    const CrearRespuesta = () => {

        if (SQLEjecutar === '') {
            mostrarToast('Por favor, ingrese una consulta SQL válida.', 'error', 3000);
            return;
        }
        if (TablasSQLResultado === '') {
            mostrarToast('Por favor, ejecute una consulta SQL para obtener resultados.', 'error', 3000);
            return;
        }
        apiClient.post('/ejericicios/RevisarRespuesta', {
            ejercicioId: IdEjercicioResolver,
            sqlIntento: SQLEjecutar,
            Tabla_Usuario: TablasSQLResultado
        })
            .then(response => {
                console.log('Respuesta de la API:', response);

                response.data.esCorrecto === true ? AbrirPopUPCorrecto() : mostrarToast('Respuesta incorrecta, vuelve a intentarlo!', 'error', 3000);


            })
            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                mostrarToast('Error: ' + error.response.data.error, 'error', 3000);
            });

    }


    const [SQLEjecutar, SetSQLEjecutar] = useState('')
    const SetterSQLEjecutar = (event) => {
        SetSQLEjecutar(event.target.value)
    }

    const [TablasDisponibles, SetTablasDisponibles] = useState('')
    const SetterTablasDisponibles = (event) => {
        SetTablasDisponibles(event.target.value)
    }

    const [EstructuraDB, SetEstructuraDB] = useState('')
    const SetterEstructuraDB = (event) => {
        SetEstructuraDB(event.target.value)
    }

    const [DatosDB, SetDatosDB] = useState('')
    const SetterDatosDB = (event) => {
        SetDatosDB(event.target.value)
    }

    const [TablasSQLResultado, SetTablasSQLResultado] = useState('')
    const SetterTablasSQLResultado = (event) => {
        SetTablasSQLResultado(event.target.value)
    }

    const [TablaInicial, SetTablaInicial] = useState('')
    const SetterTablaInicial = (event) => {
        SetTablaInicial(event.target.value)
    }


    const [RespuestaIA, SetRespuestaIA] = useState('')
    const SetterRespuestaIA = (event) => {
        SetRespuestaIA(event.target.value)
    }

    const [MostrarTabla, SetMostrarTabla] = useState(false)
    const SetterMostrarTabla = (event) => {
        SetMostrarTabla(event.target.value)
    }

    const [MostrarIA, SetMostrarIA] = useState(false)
    const SetterMostrarIA = (event) => {
        SetMostrarIA(event.target.value)
    }

    const [CargandoRespuestaIA, SetCargandoRespuestaIA] = useState('')
    const SetterCargandoRespuestaIA = (event) => {
        SetCargandoRespuestaIA(event.target.value)
    }

    const [tabActiva, setTabActiva] = useState('problema');

    const [erroresExpandidos, setErroresExpandidos] = useState({});

    // Función para parsear la respuesta de la IA y extraer los errores
    const parsearErroresIA = (respuesta) => {
        if (!respuesta) return [];

        // Verificar si explícitamente dice que no hay errores
        if (respuesta.toLowerCase().includes('no hay error encontrado') ||
            respuesta.toLowerCase().includes('no se encontró ningún error')) {
            return [];
        }

        const errores = [];

        // Patrón flexible que captura TODO lo que está entre el número y los dos puntos
        // Ejemplos que captura:
        // - "1. Lógico:"
        // - "1. Error Lógico:"
        // - "1. Error de Sintaxis:"
        // - "1. Sintaxis:"
        // - "1. Conceptual:"
        const regex = /(\d+)\.\s*([^:]+?):\s*([^\n]+?)\s*\n\s*[-–—]\s*¿?Por\s*qué\s*es\s*un\s*error\??:?\s*([^\n]+(?:\n(?!\d+\.|\n\n)[^\n]+)*)/gi;

        let match;
        while ((match = regex.exec(respuesta)) !== null) {
            errores.push({
                numero: match[1],
                tipo: match[2].trim(),
                descripcion: match[3].trim(),
                explicacion: match[4].trim().replace(/\s+/g, ' ')
            });
        }

        return errores;
    };

    const toggleError = (index) => {
        setErroresExpandidos(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const ObtenerDatosEjercicio = () => {
        // Obtener los datos del ejercicio seleccionado
        console.log('ID del ejercicio a resolver:', IdEjercicioResolver);

        // Registrar inicio de ejercicio
        apiClient.post('/ejericicios/IniciarEjercicio', { ejercicioId: IdEjercicioResolver })
            .then(res => console.log(res.data.message))
            .catch(err => console.error('Error al registrar inicio de ejercicio:', err));


        let idBaseDatos = '';

        apiClient.get('/ejericicios/ObtenerEjercicio_Usuario/' + IdEjercicioResolver)
            .then(response => {
                const ejercicio = response.data.ejercicio;
                console.log(response.data)
                console.log('Datos del ejercicio:', ejercicio);
                SetResumenEjercicio(ejercicio.resumen || '');
                SetMostrarTabla(ejercicio.permitirsolucion || false);
                SetMostrarIA(ejercicio.permitiria || false);
                SetProblemaEjercicio(ejercicio.problema || '');
                SetIDDBSeleccionadaEjercicio(ejercicio.id_basedatos || '');
                idBaseDatos = ejercicio.id_basedatos || '';
                SetSolucionEjercicio(ejercicio.solucion || '');
                SetTablaSolucionEjercicio(response.data.Tablas || '');
                console.log(ejercicio.tabla_solucion)
                // Cargar la base de datos
                apiClient.get('/basedatos/ObtenerDB_publico/' + idBaseDatos)
                    .then(response => {
                        const { estructura, db } = response.data;

                        console.log('DatosDB:', db);
                        console.log('Estructura:', estructura);

                        SetEstructuraDB(estructura);
                        SetDatosDB(db);

                        // Ejecutar query inicial
                        const primeraTabla = estructura[0]?.tablename;
                        if (primeraTabla) {
                            apiClient.post('/basedatos/EjecutarQuery', {
                                dbId: idBaseDatos,
                                query: 'SELECT * FROM ' + primeraTabla
                            })
                                .then(response => {
                                    console.log('SQL Ejecutado:', response);
                                    SetTablaInicial(response.data.filas);
                                })
                                .catch(error => {
                                    console.error('Error del backend:', error.response?.data?.error || error.message);
                                    mostrarToast(error.response?.data?.error || 'Error desconocido', 'error', 3000);
                                });
                        } else {
                            mostrarToast('No hay tablas para mostrar.', 'warning', 3000);
                        }

                    })
                    .catch(error => {
                        console.error('Error al obtener la base de datos:', error);
                        mostrarToast('Error al obtener base de datos', 'error', 3000);
                    });

            })
            .catch(error => {
                console.error('Error al obtener el ejercicio:', error);
                mostrarToast('Error al cargar el ejercicio', 'error', 3000);
            });

    }



    const EnviarMensajeIA = () => {
        // Validar que los valores no estén vacíos
        if (!DatosDB.sql_init || !ProblemaEjercicio || !SQLEjecutar) {
            console.warn('Uno o más valores requeridos están vacíos.');
            mostrarToast('Debes tener una respuesta para consultar.', 'warning', 3000);
            return; // Detener la ejecución si algún valor está vacío
        }

        // Convertir la tabla del estudiante a formato legible si existe
        let tablaEstudianteFormateada = null;
        if (TablasSQLResultado && Array.isArray(TablasSQLResultado) && TablasSQLResultado.length > 0) {
            // Convertir el array de objetos a formato de tabla
            tablaEstudianteFormateada = JSON.stringify(TablasSQLResultado, null, 2);
        }

        console.log('Enviando a IA:', {
            contexto: DatosDB.sql_init,
            problema: ProblemaEjercicio,
            respuesta: SQLEjecutar,
            ejercicioId: IdEjercicioResolver,
            tablaEstudiante: tablaEstudianteFormateada
        });

        SetCargandoRespuestaIA(true);

        apiClient.post('/IA/PromptA', {
            contexto: DatosDB.sql_init,
            problema: ProblemaEjercicio,
            respuesta: SQLEjecutar,
            ejercicioId: IdEjercicioResolver,
            tablaEstudiante: tablaEstudianteFormateada
        })
            .then(response => {
                console.log('Respuesta ia:', response.data);
                SetRespuestaIA(response.data.respuesta);
                SetCargandoRespuestaIA(false);
                mostrarToast('Respuesta de IA recibida', 'success', 3000);
            })
            .catch(error => {
                console.error('Error del backend:', error.response?.data?.error || 'Error desconocido');
                SetCargandoRespuestaIA(false);
                mostrarToast(error.response?.data?.error || 'Error desconocido', 'error', 3000);
            });
    };

    const EnviarMensajeIA2 = () => {
        // Validar que los valores no estén vacíos


        SetCargandoRespuestaIA(true);

        apiClient.post('/IA/PromptB', {
            contexto: DatosDB.sql_init,
            problema: ProblemaEjercicio,
            respuesta: SQLEjecutar,
            ejercicioId: IdEjercicioResolver
        })
            .then(response => {
                console.log('Respuesta ia:', response.data);
                SetRespuestaIA(response.data.respuesta);
                SetCargandoRespuestaIA(false);
                mostrarToast('Respuesta de IA recibida', 'success', 3000);
            })
            .catch(error => {
                console.error('Error del backend:', error.response?.data?.error || 'Error desconocido');
                SetCargandoRespuestaIA(false);
                mostrarToast(error.response?.data?.error || 'Error desconocido', 'error', 3000);
            });
    };

    const AbrirAyudaIA = () => {
        document.getElementById('AyudaIA').showModal();

    }

    const CerrarAyudaIA = () => {
        document.getElementById('AyudaIA').close();
    }


    useEffect(() => {
        ObtenerDatosEjercicio();

    }, []);



    return (
        <div>
            <Navbar />

            <div className='flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-4rem)] gap-2 p-2'>
                {/* Columna Izquierda */}
                <div className='w-full lg:w-1/2 flex flex-col gap-2'>
                    {/* Tablas disponibles en la DB */}
                    <div className='h-[300px] lg:h-1/2 min-h-[300px] flex flex-col rounded-lg p-3 overflow-hidden shadow-lg bg-white'>
                        <div className='flex justify-between gap-2 mb-2 flex-shrink-0'>
                            <h3 className="flex-1 text-xl font-bold text-primary">Tablas Disponibles</h3>
                            <div className="flex-1">
                                <div className="form-control">
                                    <select onChange={manejarCambio} defaultValue="" className="select select-bordered select-primary select-sm">
                                        {EstructuraDB.length !== 0 && EstructuraDB.map((tabla, index) => (
                                            <option key={index} value={tabla.tablename}>
                                                {tabla.tablename}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='flex-1 overflow-auto min-h-0'>
                            <CustomTable itemsPerPage={10} data={TablaInicial} />
                        </div>
                    </div>

                    {/* Información del ejercicio con tabs */}
                    <div className='h-[300px] lg:h-1/2 min-h-[300px] flex flex-col rounded-lg p-3 overflow-hidden shadow-lg bg-white'>
                        <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                            <h3 className="text-xl font-bold text-primary">Información del Ejercicio</h3>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Contenedor de tabs */}
                            <div role="tablist" className="tabs tabs-boxed mb-2 flex-shrink-0 bg-base-200 flex-wrap">
                                <button
                                    className={`tab tab-sm sm:tab-md ${tabActiva === 'problema' ? 'tab-active' : ''}`}
                                    onClick={() => setTabActiva('problema')}
                                >
                                    <FaLightbulb className="mr-1 hidden sm:inline" />
                                    <span className="text-xs sm:text-sm">Problema</span>
                                </button>
                                <button
                                    className={`tab tab-sm sm:tab-md ${tabActiva === 'contexto' ? 'tab-active' : ''}`}
                                    onClick={() => setTabActiva('contexto')}
                                >
                                    <FaDatabase className="mr-1 hidden sm:inline" />
                                    <span className="text-xs sm:text-sm">Contexto DB</span>
                                </button>
                                {MostrarTabla && (
                                    <button
                                        className={`tab tab-sm sm:tab-md ${tabActiva === 'tabla' ? 'tab-active' : ''}`}
                                        onClick={() => setTabActiva('tabla')}
                                    >
                                        <FaTable className="mr-1 hidden sm:inline" />
                                        <span className="text-xs sm:text-sm">Tabla Esperada</span>
                                    </button>
                                )}

                            </div>

                            {/* Contenido scrolleable */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-base-100 rounded-lg p-4 border border-base-300 min-h-0">
                                {tabActiva === 'problema' && (
                                    <div className="w-full">
                                        <p className="leading-relaxed text-xs sm:text-sm break-words whitespace-pre-wrap">
                                            {ProblemaEjercicio}
                                        </p>
                                    </div>
                                )}

                                {tabActiva === 'contexto' && (
                                    <div className="w-full">
                                        <p className="leading-relaxed text-xs sm:text-sm break-words whitespace-pre-wrap">
                                            {DatosDB.descripcion}
                                        </p>
                                    </div>
                                )}

                                {tabActiva === 'tabla' && MostrarTabla && (
                                    <div className="w-full">
                                        <CustomTable itemsPerPage={10} data={TablaSolucionEjercicio} />
                                    </div>
                                )}


                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha */}
                <div className='w-full lg:w-1/2 flex flex-col gap-2'>
                    {/* Editor SQL */}
                    <div className='h-[300px] lg:h-1/2 min-h-[300px] flex flex-col rounded-lg p-3 overflow-hidden shadow-lg bg-white'>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 flex-shrink-0">
                            <h3 className="text-xl font-bold text-primary">Editor SQL</h3>

                            <div className='flex flex-row gap-2'>
                                <button className='btn btn-primary btn-sm shadow-lg' onClick={() => AbrirAyudaIA()}>
                                    <FaLightbulb className="mr-1" />
                                    Revisar IA
                                </button>

                                <button onClick={() => EjecutarSQL()} className='btn btn-secondary btn-sm shadow-lg'>
                                    <FaPlay className="mr-1" />
                                    <span className="hidden sm:inline">Ejecutar SQL</span>
                                </button>
                            </div>


                        </div>
                        <div className='flex-1 overflow-auto min-h-0'>
                            <CodeMirror
                                className='h-full'
                                value={SQLEjecutar}
                                placeholder={"SELECT * FROM tabla WHERE condicion;"}
                                onChange={SetSQLEjecutar}
                                height='100%'
                                extensions={[sql()]}
                            />
                        </div>
                    </div>

                    {/* Resultados de ejecución */}
                    <div className='h-[300px] lg:h-1/2 min-h-[300px] flex flex-col rounded-lg p-3 overflow-hidden shadow-lg bg-white'>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 flex-shrink-0">
                            <h3 className="text-xl font-bold text-primary">Resultado de Ejecución</h3>
                            <div className='flex flex-row gap-2'>
                                <button onClick={() => CancelarCreacionDERespuesta()} className='btn btn-error btn-sm shadow-lg'>
                                    <FaTimes className="mr-1" />
                                    <span className="hidden sm:inline">Salir</span>
                                </button>
                                <button onClick={() => CrearRespuesta()} className='btn btn-primary btn-sm shadow-lg'>
                                    <FaCheckCircle className="mr-1" />
                                    <span className="hidden sm:inline">Comprobar</span>
                                </button>
                            </div>
                        </div>
                        <div className='flex-1 overflow-auto min-h-0'>
                            <CustomTable itemsPerPage={10} data={TablasSQLResultado} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Pop up de respuesta correcta */}
            <dialog id="Respuesta_Correcta" className="modal">
                <div className="modal-box flex flex-col gap-2 w-11/12 max-w-5xl">
                    <h3 className="font-bold text-lg text-primary">Felicidades! Completaste correctamente el ejercicio</h3>
                    <p className="py-4">Tu respuesta fue correcta, puedes intentar resolver el ejercicio nuevamente o probar uno diferente.</p>
                    <div className='flex gap-3 flex-row'>
                        <button onClick={() => IrCrearEjercicio()} className="btn btn-primary">Volver al inicio</button>
                        <button onClick={() => CerrarPopUpCorrecto()} className="btn btn-secondary">Regresar al ejercicio</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>


            <dialog id="AyudaIA" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <h3 className="font-bold text-lg text-primary">Revisar respuesta con IA</h3>

                    <p className="p-4 opacity-50">Esta es una ayuda que te mostrara tus errores sin decir la respuesta</p>

                    <button onClick={() => EnviarMensajeIA()} className='btn btn-primary'>
                        Revisar ahora
                        <FaCheckCircle className="ml-1" />
                    </button>

                    {/* Mostrar en texto plano la respuesta de la ia */}

                    {CargandoRespuestaIA ? (
                        <div className="flex items-center justify-center mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            <span className="ml-2">Cargando respuesta de IA...</span>
                        </div>
                    ) : (
                        RespuestaIA && (() => {
                            const errores = parsearErroresIA(RespuestaIA);

                            if (errores.length === 0) {
                                return (
                                    <div className="mt-4 p-6 bg-success bg-opacity-10 border-2 border-success rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FaCheckCircle className="text-3xl " />
                                            <div>
                                                <h4 className="font-bold text-lg ">¡Excelente trabajo!</h4>
                                                <p className="text-sm opacity-70">No se encontraron errores en tu consulta SQL.</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaLightbulb className="text-warning text-xl" />
                                        <h4 className="font-bold text-lg">Errores identificados: {errores.length}</h4>
                                    </div>

                                    {errores.map((error, index) => (
                                        <div
                                            key={index}
                                            className="collapse collapse-arrow bg-base-200 border border-base-300 shadow-md hover:shadow-lg transition-all"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={erroresExpandidos[index] || false}
                                                onChange={() => toggleError(index)}
                                            />
                                            <div className="collapse-title font-medium flex items-start gap-3">
                                                <span className="badge badge-error badge-lg">{error.numero}</span>
                                                <div className="flex-1">
                                                    <span className="font-bold text-error">{error.tipo}</span>
                                                    <p className="text-sm opacity-80 mt-1">{error.descripcion}</p>
                                                </div>
                                            </div>
                                            <div className="collapse-content bg-base-100">
                                                <div className="pt-4 pl-2 border-l-4 border-warning">
                                                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                        <FaLightbulb className="text-warning" />
                                                        ¿Por qué es un error?
                                                    </p>
                                                    <p className="text-sm leading-relaxed">{error.explicacion}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()
                    )}



                    <div className="modal-action">
                        <button onClick={() => CerrarAyudaIA()} className='btn btn-primary'>Minimizar</button>
                    </div>
                </div>
            </dialog>

        </div>
    )
}

export default RealizarEjercicio