
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
import { FaDatabase, FaCode, FaPlay, FaTimes, FaTable, FaArrowLeft, FaEye } from 'react-icons/fa';

const ProbarDB = ({ }) => {

    const Navigate = useNavigate();
    const { mostrarToast } = useToast();

    const { valorGlobal, setValorGlobal,
        Logeado, SetLogedao,
        Nombre, SetNombre,
        Rol, SetRol,
        topicosSeleccionados, setTopicosSeleccionados,
        NombreEjercicio, SetNombreEjercicio, SetterNombreEjercicio,
        ResumenEjercicio, SetResumenEjercicio, SetterResumenEjercicio,
        ProblemaEjercicio, SetProblemaEjercicio, SetterProblemaEjercicio,
        DificultadEjercicio, SetDificultadEjercicio, SetterDificultadEjercicio,
        PermitirIAEjercicio, SetPermitirIAEjercicio, SetterPermitirIAEjercicio,
        VerRespuestaEsperada, SetVerRespuestaEsperada, SetterVerRespuestaEsperada,
        IDDBSeleccionadaEjercicio, IDSetDBSeleccionadaEjercicio, IDSetterDBSeleccionadaEjercicio,
        SolucionEjercicio, SetSolucionEjercicio, SetterSolucionEjercicio,
        ListaTopicosEjercicios, SetListaTopicosEjercicios, SetterListaTopicosEjercicios,
        TablaSolucionEjercicio, SetTablaSolucionEjercicio, SetterTablaSolucionEjercicio,
        ListaTopicosEjercicio, SetListaTopicosEjercicio, SetterListaTopicosEjercicio,
        ProbarDBIDMENU, SetProbarDBIDMENU, SetterProbarDBIDMENU,

    } = useContext(EstadoGlobalContexto)

    const EjecutarSQL = () => {
        console.log('Ejecutar SQL', SQLEjecutar);
        apiClient.post('/basedatos/EjecutarQuery', { dbId: ProbarDBIDMENU, query: SQLEjecutar })
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
        apiClient.post('/basedatos/EjecutarQuery', { dbId: ProbarDBIDMENU, query: 'select * from ' + tablaSeleccionada })
            .then(response => {
                console.log('SQL Ejecutado:', response);
                SetTablaInicial(response.data.filas)
            })
            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                mostrarToast(error.response.data.error, 'error', 3000);
            });
    }

    const IrCrearEjercicio = () => { Navigate('/CrearDB') }

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

    useEffect(() => {



        console.log('IDDBSeleccionadaEjercicio:', ProbarDBIDMENU);
        apiClient.get('/basedatos/ObtenerDB/' + ProbarDBIDMENU)
            .then(response => {
                console.log('DatosDB:', response.data.db);
                console.log('Estructura:', response.data.estructura);

                SetEstructuraDB(response.data.estructura);
                SetDatosDB(response.data.db);

                apiClient.post('/basedatos/EjecutarQuery', { dbId: ProbarDBIDMENU, query: 'select * from ' + response.data.estructura[0].tablename })
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
                {/* Columna Izquierda */}
                <div className='w-full lg:w-1/2 flex flex-col gap-2'>
                    {/* Tablas disponibles en la DB */}
                    <div className='h-[300px] lg:h-1/2 min-h-[300px] flex flex-col rounded-lg p-3 overflow-hidden shadow-lg bg-white'>
                        <div className='flex justify-between gap-2 mb-2 flex-shrink-0'>
                            <h3 className="flex-1 text-xl font-bold text-primary">Explorar Base de Datos</h3>
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

                    {/* Contexto de la DB */}
                    <div className='h-[300px] lg:h-1/2 min-h-[300px] flex flex-col rounded-lg p-3 overflow-hidden shadow-lg bg-white'>
                        <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                            <h3 className="text-xl font-bold text-primary">Contexto de Base de Datos</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-base-100 rounded-lg p-4 border border-base-300 min-h-0">
                            <h4 className="text-base sm:text-lg font-semibold text-accent mb-3 flex items-center">
                                <FaDatabase className="mr-2 flex-shrink-0" />
                                <span>Descripción de la Base de Datos</span>
                            </h4>
                            <p className="leading-relaxed text-xs sm:text-sm break-words whitespace-pre-wrap">{DatosDB.descripcion}</p>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha */}
                <div className='w-full lg:w-1/2 flex flex-col gap-2'>
                    {/* Editor SQL */}
                    <div className='h-[300px] lg:h-1/2 min-h-[300px] flex flex-col rounded-lg p-3 overflow-hidden shadow-lg bg-white'>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 flex-shrink-0">
                            <h3 className="text-xl font-bold text-primary">Probar Consultas SQL</h3>
                            <button onClick={() => EjecutarSQL()} className='btn btn-secondary btn-sm shadow-lg'>
                                <FaPlay className="mr-1" />
                                <span className="hidden sm:inline">Ejecutar SQL</span>
                            </button>
                        </div>
                        <div className='flex-1 overflow-auto min-h-0'>
                            <CodeMirror
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
                            <h3 className="text-xl font-bold text-primary">Resultado de Consulta</h3>
                            <button onClick={() => CancelarCreacionDERespuesta()} className='btn btn-primary btn-sm shadow-lg'>
                                <FaArrowLeft className="mr-1" />
                                <span className="hidden sm:inline">Volver al Menú</span>
                            </button>
                        </div>
                        <div className='flex-1 overflow-auto min-h-0'>
                            <CustomTable itemsPerPage={10} data={TablasSQLResultado} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProbarDB