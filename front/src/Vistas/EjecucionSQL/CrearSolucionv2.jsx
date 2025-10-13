
import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';

import './SQLEjecucion.css';
import CustomTable from '../../AuxS/CustomTable';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { FaDatabase, FaCode, FaPlay, FaSave, FaTimes, FaTable, FaFile, FaEye, FaLightbulb } from 'react-icons/fa';

const CrearSolucionv2 = () => {



    const Navigate = useNavigate();
    const { mostrarToast } = useToast();

    const { ResumenEjercicio,
        ProblemaEjercicio,
        IDDBSeleccionadaEjercicio,
        SetSolucionEjercicio,
        SetTablaSolucionEjercicio } = useContext(EstadoGlobalContexto)

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

    const IrCrearEjercicio = () => { Navigate('/CrearEjercicio') }

    const CancelarCreacionDERespuesta = () => {
        SetSQLEjecutar('');
        SetTablaInicial('');
        IrCrearEjercicio();

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

        SetSolucionEjercicio(SQLEjecutar);
        SetTablaSolucionEjercicio(TablasSQLResultado);


        IrCrearEjercicio();
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

    const [tabActiva, setTabActiva] = useState('problema');

    useEffect(() => {



        console.log('IDDBSeleccionadaEjercicio:', IDDBSeleccionadaEjercicio);
        apiClient.get('/basedatos/ObtenerDB/' + IDDBSeleccionadaEjercicio)
            .then(response => {
                console.log('DatosDB:', response.data.db);
                console.log('Estructura:', response.data.estructura);

                SetEstructuraDB(response.data.estructura);
                SetDatosDB(response.data.db);

                apiClient.post('/basedatos/EjecutarQuery', { dbId: IDDBSeleccionadaEjercicio, query: 'select * from ' + response.data.estructura[0].tablename })
                    .then(response => {
                        console.log('SQL Ejecutado:', response);

                        SetTablaInicial(response.data.filas)

                    })
                    .catch(error => { console.error('Error del backend:', error.response.data.error); mostrarToast(error.response.data.error, 'error', 3000); });


            })
            .catch(error => { console.error('Error al obtener usuarios:', error); });

    }, []);





    return (
        <div>
            <Navbar />

            <div className='flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-4rem)] gap-2 p-2'>
                <div className='w-full lg:w-1/2 flex flex-col gap-2'>
                    <div className=' h-[300px] lg:h-1/2 min-h-[300px] flex flex-col rounded-lg p-2 overflow-scroll shadow-lg bg-white'>

                        <div>
                            <div className='flex justify-between gap-2 '>
                                <h3 className="flex-1 text-xl font-bold text-primary mb-2 flex-shrink-0">Tablas Disponibles</h3>

                                <div className="flex-1 flex-col gap-2 overflow-hidden">
                                    <div className="form-control flex-shrink-0 flex">
                                        <select onChange={manejarCambio} defaultValue="" className="flex-1 select select-bordered select-primary select-sm">
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
                    </div>

                    {/* Sección de Información del Ejercicio */}

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
                                    className={`tab tab-sm sm:tab-md ${tabActiva === 'resumen' ? 'tab-active' : ''}`}
                                    onClick={() => setTabActiva('resumen')}
                                >
                                    <FaFile className="mr-1 hidden sm:inline" />
                                    <span className="text-xs sm:text-sm">Resumen</span>
                                </button>
                                <button
                                    className={`tab tab-sm sm:tab-md ${tabActiva === 'contexto' ? 'tab-active' : ''}`}
                                    onClick={() => setTabActiva('contexto')}
                                >
                                    <FaDatabase className="mr-1 hidden sm:inline" />
                                    <span className="text-xs sm:text-sm">Contexto DB</span>
                                </button>
                            </div>

                            {/* Contenido scrolleable con límite de altura */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-base-100 rounded-lg p-4 border border-base-300 min-h-0">
                                {tabActiva === 'problema' && (
                                    <div className="w-full">
                                        <h4 className="text-base sm:text-lg font-semibold text-accent mb-3 flex items-center">
                                            <FaLightbulb className="mr-2 flex-shrink-0" />
                                            <span>Problema a Resolver</span>
                                        </h4>
                                        <p className="leading-relaxed text-xs sm:text-sm break-words whitespace-pre-wrap">{ProblemaEjercicio}</p>
                                    </div>
                                )}

                                {tabActiva === 'resumen' && (
                                    <div className="w-full">
                                        <h4 className="text-base sm:text-lg font-semibold text-accent mb-3 flex items-center">
                                            <FaFile className="mr-2 flex-shrink-0" />
                                            <span>Resumen del Ejercicio</span>
                                        </h4>
                                        <p className="leading-relaxed text-xs sm:text-sm break-words whitespace-pre-wrap">{ResumenEjercicio}</p>
                                    </div>
                                )}

                                {tabActiva === 'contexto' && (
                                    <div className="w-full">
                                        <h4 className="text-base sm:text-lg font-semibold text-accent mb-3 flex items-center">
                                            <FaDatabase className="mr-2 flex-shrink-0" />
                                            <span>Contexto de Base de Datos</span>
                                        </h4>
                                        <p className="leading-relaxed text-xs sm:text-sm break-words whitespace-pre-wrap">{DatosDB.descripcion}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                </div>

                {/* Columna Derecha */}
                <div className='w-full lg:w-1/2 flex flex-col gap-2'>
                    {/* Sección de Datos del ejercicio */}

                    <div className=' h-[300px] lg:h-1/2 min-h-[300px] flex flex-col rounded-lg p-3 overflow-hidden shadow-lg bg-white'>

                        <div className='flex-1 overflow-auto min-h-0'>
                            <div className='h-[70%]'>
                                <div className="flex items-center justify-between mb-4">

                                    <h3 className="text-xl font-bold text-primary mb-2 flex-shrink-0">Editor SQL</h3>

                                    <div className='flex gap-2'>

                                        <button onClick={() => EjecutarSQL()} className='btn btn-secondary shadow-lg '>
                                            <FaPlay className="mr-2" />
                                            Ejecutar SQL
                                        </button>
                                    </div>
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
                    </div>
                    {/* Sección de Resultados */}
                    <div className='h-[300px] lg:h-1/2 min-h-[300px] flex flex-col rounded-lg p-3 overflow-hidden shadow-lg bg-white'>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 flex-shrink-0">
                            <h3 className="text-xl font-bold text-primary">Resultado de Ejecución</h3>

                            <div className='flex flex-row gap-2'>
                                <button onClick={() => CancelarCreacionDERespuesta()} className='btn btn-error btn-sm shadow-lg'>
                                    <FaTimes className="mr-1" />
                                    <span className="hidden sm:inline">Cancelar</span>
                                </button>
                                <button onClick={() => CrearRespuesta()} className='btn btn-primary btn-sm shadow-lg'>
                                    <FaSave className="mr-1" />
                                    <span className="hidden sm:inline">Guardar</span>
                                </button>
                            </div>
                        </div>

                        {/* Contenedor con scroll interno */}
                        <div className='flex-1 overflow-auto min-h-0'>
                            <CustomTable itemsPerPage={10} data={TablasSQLResultado} />
                        </div>
                    </div>
                </div>
            </div>

        </div>

    )
}



export default CrearSolucionv2