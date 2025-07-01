
import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';
import confetti from 'canvas-confetti';

import './SQLEjecucion.css';
import CustomTable from '../../AuxS/CustomTable';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

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
            })
            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                mostrarToast('SQL Error: ' + error.response.data.detalle, 'error', 3000);
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

    const IrCrearEjercicio = () => { Navigate('/') }

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


    const [CargandoRespuestaIA, SetCargandoRespuestaIA] = useState('')
    const SetterCargandoRespuestaIA = (event) => {
        SetCargandoRespuestaIA(event.target.value)
    }

    const ObtenerDatosEjercicio = () => {
        // Obtener los datos del ejercicio seleccionado
        console.log('ID del ejercicio a resolver:', IdEjercicioResolver);

        let idBaseDatos = '';

        apiClient.get('/ejericicios/ObtenerEjercicio_Usuario/' + IdEjercicioResolver)
            .then(response => {
                const ejercicio = response.data.ejercicio;
                console.log(response.data)
                console.log('Datos del ejercicio:', ejercicio);
                SetResumenEjercicio(ejercicio.resumen || '');
                SetProblemaEjercicio(ejercicio.problema || '');
                SetIDDBSeleccionadaEjercicio(ejercicio.id_basedatos || '');
                idBaseDatos = ejercicio.id_basedatos || '';
                SetSolucionEjercicio(ejercicio.solucion || '');
                SetTablaSolucionEjercicio(response.data.Tablas || '');
                console.log(ejercicio.tabla_solucion)
                // Cargar la base de datos
                apiClient.get('/basedatos/ObtenerDB/' + idBaseDatos)
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
        SetCargandoRespuestaIA(true);

        apiClient.post('/IA/PromptA', { contexto: DatosDB.sql_init, problema: ProblemaEjercicio, respuesta: SQLEjecutar })
            .then(response => {
                console.log('Respuesta ia:', response.data);
                SetRespuestaIA(response.data.respuesta);
                SetCargandoRespuestaIA(false);
                mostrarToast(response.data.message, 'success', 3000);
            })
            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                SetCargandoRespuestaIA(false);
                mostrarToast(error.response.data.error, 'error', 3000);
            });
    }

    const EnviarMensajeIA2 = () => {
        SetCargandoRespuestaIA(true);

        apiClient.post('/IA/PromptB', { contexto: DatosDB.sql_init, problema: ProblemaEjercicio, respuesta: SQLEjecutar })
            .then(response => {
                console.log('Respuesta ia:', response.data);
                SetRespuestaIA(response.data.respuesta);
                SetCargandoRespuestaIA(false);
                mostrarToast(response.data.message, 'success', 3000);
            })
            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                SetCargandoRespuestaIA(false);
                mostrarToast(error.response.data.error, 'error', 3000);
            });
    }


    useEffect(() => {
        ObtenerDatosEjercicio();

    }, []);



    return (
        <div className='EjecutarSQL '>
            <div className='Navbar'>
                <Navbar />
            </div>


            {/* Tablas disponibles en la DB */}
            <div className='ContenidoA p-4 rounded-lg shadow bg-base-200'>
                <label className='label'> Tablas disponibles en base de datos</label>

                <select onChange={manejarCambio} defaultValue="" className="select w-full mb-2">

                    {EstructuraDB.length !== 0 && EstructuraDB.map((tabla, index) => (
                        <option key={index} value={tabla.tablename}>
                            {tabla.tablename}
                        </option>
                    ))}
                </select>

                <CustomTable itemsPerPage={4} data={TablaInicial} />
            </div>



            {/* Contenedor para el editor de SQL */}
            <div className='ContenidoB p-4 rounded-lg shadow bg-base-200'>
                <div className='h-[80%]'>
                    <div className='flex flex-row justify-between p-3  gap-3 mb-2'>
                        <label className='label'> SQL a ejecutar</label>
                        <button onClick={() => EjecutarSQL()} className='btn btn-primary'>Ejecutar SQL</button>
                    </div>
                    <CodeMirror className='h-full'
                        value={SQLEjecutar}
                        placeholder={"SELECT * FROM tabla WHERE condicion;"}
                        onChange={SetSQLEjecutar}
                        height='100%'
                        extensions={[sql()]}
                    ></CodeMirror>
                </div>
            </div>



            <div className='ContenidoC p-4 rounded-lg shadow bg-base-200'>
                <div className="tabs tabs-lift h-full overflow-scroll">
                    <input defaultChecked type="radio" name="my_tabs_3" className="tab" aria-label="Problema" />
                    <div className="tab-content bg-base-100 border-base-300 p-6">{ProblemaEjercicio}</div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Contexto DB" />
                    <div className="tab-content bg-base-100 border-base-300 p-6">{DatosDB.descripcion}</div>


                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Tabla esperada" />
                    <div className="tab-content bg-base-100 border-base-300 p-6">  <CustomTable itemsPerPage={4} data={TablaSolucionEjercicio} /> </div>


                    <input type="radio" name="my_tabs_3" className="tab" aria-label="IA" />

                    {/* Contenedor IA mejorado */}
                    <div className="tab-content bg-base-100 border-base-300 p-6 h-full overflow-hidden">
                        <div className="flex flex-col h-full gap-3">
                            {/* Botones - apilados en móvil */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => EnviarMensajeIA()} className="btn btn-primary sm:flex-1">Revisión de respuesta</button>
                                <button onClick={() => EnviarMensajeIA2()} className="btn btn-primary sm:flex-1">Ayuda paso a paso</button>
                            </div>

                            {/* Área de texto con scroll controlado */}
                            <div className="flex-1 min-h-0 overflow-y-auto bg-base-200 shadow-lg p-4 rounded-lg">

                                {CargandoRespuestaIA && <span className="loading loading-spinner loading-md"></span>}
                                {
                                    <div className='whitespace-pre'>
                                        {RespuestaIA}
                                    </div>

                                }
                                {
                                    RespuestaIA === '' && !CargandoRespuestaIA && <p className="text-gray-500">respuesta de IA...</p>
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='ContenidoD p-4 rounded-lg shadow bg-base-200'>
                <div className='flex flex-row justify-between p-3 gap-3'>
                    <label className='label'> Resultado ejecucion </label>
                    <div className='flex flex-row gap-3'>
                        <button onClick={() => CancelarCreacionDERespuesta()} className='btn btn-error  '> Salir</button>
                        <button onClick={() => CrearRespuesta()} className='btn btn-primary'> Comprobar respuesta</button>
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