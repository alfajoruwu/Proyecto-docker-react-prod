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

        SetCargandoRespuestaIA(true);

        apiClient.post('/IA/PromptA', {
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


    useEffect(() => {
        ObtenerDatosEjercicio();

    }, []);



    return (
        <div className='EjecutarSQL '>
            <div className='Navbar'>
                <Navbar />
            </div>


            {/* Tablas disponibles en la DB - Diseño moderno */}
            <div className='ContenidoA p-4 rounded-lg shadow bg-base-200'>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                        <FaDatabase className="text-xl text-primary-content" />
                    </div>
                    <h3 className="text-xl font-bold text-primary">Tablas Disponibles</h3>
                </div>

                <select onChange={manejarCambio} defaultValue="" className="select select-bordered select-primary w-full mb-2">

                    {EstructuraDB.length !== 0 && EstructuraDB.map((tabla, index) => (
                        <option key={index} value={tabla.tablename}>
                            {tabla.tablename}
                        </option>
                    ))}
                </select>

                <CustomTable itemsPerPage={4} data={TablaInicial} />
            </div>



            {/* Contenedor para el editor de SQL - Diseño moderno */}
            <div className='ContenidoB p-4 rounded-lg shadow bg-base-200'>
                <div className='h-[80%]'>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                                <FaCode className="text-xl text-secondary-content" />
                            </div>
                            <h3 className="text-xl font-bold text-secondary">Editor SQL</h3>
                        </div>
                        <button onClick={() => EjecutarSQL()} className='btn btn-secondary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'>
                            <FaPlay className="mr-2" />
                            Ejecutar SQL
                        </button>
                    </div>
                    <CodeMirror className='h-full'
                        value={SQLEjecutar}
                        placeholder={"SELECT * FROM tabla WHERE condicion;"}
                        onChange={SetSQLEjecutar}
                        height='100%'
                        extensions={[sql()]}
                    />
                </div>
            </div>



            {/* Información del ejercicio - Diseño moderno */}
            <div className="ContenidoC p-4 rounded-lg shadow bg-base-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                        <FaEye className="text-xl text-info-content" />
                    </div>
                    <h3 className="text-xl font-bold text-info">Información del Ejercicio</h3>
                </div>

                <div className="tabs tabs-lifted h-full overflow-scroll">
                    {/* Pestaña: Problema */}
                    <input defaultChecked type="radio" id="tab-problema" name="my_tabs_3" className="tab tab-lifted" aria-label="Problema" />
                    <div className="tab-content bg-base-100 border-base-300 rounded-box p-6 max-h-[400px] overflow-y-auto">
                        <div className="prose max-w-none">
                            <h4 className="text-lg font-semibold text-accent mb-3">
                                <FaLightbulb className="inline mr-2" />
                                Problema a Resolver
                            </h4>
                            <ReactMarkdown>{ProblemaEjercicio}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Pestaña: Contexto DB */}
                    <input type="radio" id="tab-contexto" name="my_tabs_3" className="tab tab-lifted" aria-label="Contexto DB" />
                    <div className="tab-content bg-base-100 border-base-300 rounded-box p-6 max-h-[400px] overflow-y-auto">
                        <div className="prose max-w-none">
                            <h4 className="text-lg font-semibold text-accent mb-3">
                                <FaDatabase className="inline mr-2" />
                                Contexto de Base de Datos
                            </h4>
                            <ReactMarkdown>{DatosDB.descripcion}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Pestaña: Tabla esperada */}
                    {MostrarTabla && (
                        <>
                            <input type="radio" id="tab-tabla" name="my_tabs_3" className="tab tab-lifted" aria-label="Tabla esperada" />
                            <div className="tab-content bg-base-100 border-base-300 rounded-box p-6 max-h-[400px] overflow-y-auto">
                                <div className="prose max-w-none">
                                    <h4 className="text-lg font-semibold text-accent mb-3">
                                        <FaTable className="inline mr-2" />
                                        Tabla Esperada
                                    </h4>
                                    <CustomTable itemsPerPage={4} data={TablaSolucionEjercicio} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Pestaña: IA */}
                    {MostrarIA && (
                        <>
                            <input type="radio" id="tab-ia" name="my_tabs_3" className="tab tab-lifted" aria-label="IA" />
                            <div className="tab-content bg-base-100 border-base-300 rounded-box p-6 max-h-[400px] overflow-auto">
                                <div className="prose max-w-none mb-4">
                                    <h4 className="text-lg font-semibold text-accent mb-3">
                                        <FaRobot className="inline mr-2" />
                                        Asistente de IA
                                    </h4>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {CargandoRespuestaIA ? (
                                        <>
                                            <button disabled className="btn btn-primary sm:flex-1">Revisión de respuesta</button>
                                            <button disabled className="btn btn-primary sm:flex-1">Ayuda paso a paso</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => EnviarMensajeIA()} className="btn btn-primary sm:flex-1">Revisión de respuesta</button>
                                            <button onClick={() => EnviarMensajeIA2()} className="btn btn-primary sm:flex-1">Ayuda paso a paso</button>
                                        </>
                                    )}
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto bg-base-200 shadow-lg p-4 rounded-lg mt-3">
                                    {CargandoRespuestaIA && <span className="loading loading-spinner loading-md"></span>}
                                    {!CargandoRespuestaIA && RespuestaIA && <ReactMarkdown>{RespuestaIA}</ReactMarkdown>}
                                    {!CargandoRespuestaIA && !RespuestaIA && (
                                        <p className="text-gray-500">respuesta de IA...</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Resultados de ejecución - Diseño moderno */}
            <div className='ContenidoD p-4 rounded-lg shadow bg-base-200'>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                            <FaTable className="text-xl text-success-content" />
                        </div>
                        <h3 className="text-xl font-bold text-success">Resultado de Ejecución</h3>
                    </div>
                    <div className='flex flex-row gap-3'>
                        <button onClick={() => CancelarCreacionDERespuesta()} className='btn btn-error shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'>
                            <FaTimes className="mr-2" />
                            Salir
                        </button>
                        <button onClick={() => CrearRespuesta()} className='btn btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'>
                            <FaCheckCircle className="mr-2" />
                            Comprobar Respuesta
                        </button>
                    </div>
                </div>
                <CustomTable itemsPerPage={4} data={TablasSQLResultado} />
            </div>


            {/* Pop up */}

            <dialog id="Respuesta_Correcta" className="modal">
                <div className="modal-box flex flex-col gap-2 w-11/12 max-w-5xl">

                    <h3 className="font-bold text-lg">Felicidades!! Completaste correctamente el ejercicio</h3>

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


        </div >
    )
}

export default RealizarEjercicio