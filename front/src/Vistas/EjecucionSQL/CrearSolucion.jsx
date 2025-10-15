
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

const CrearSolucion = ({ }) => {

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
        <div className='EjecutarSQL '>
            <div className='Navbar'>
                <Navbar />
            </div>

            {/* Tablas disponibles en la DB - Diseño moderno */}
            <div className='ContenidoA p-4 rounded-lg shadow bg-base-200'>
                <div className="flex items-center gap-3 mb-4">

                    <h3 className="text-xl font-bold text-primary">Tablas Disponibles</h3>
                </div>

                <div className="space-y-4">
                    <div className="form-control">
                        <select onChange={manejarCambio} defaultValue="" className="select select-bordered select-primary w-full">

                            {EstructuraDB.length !== 0 && EstructuraDB.map((tabla, index) => (
                                <option key={index} value={tabla.tablename}>
                                    {tabla.tablename}
                                </option>
                            ))}
                        </select>
                    </div>

                    <CustomTable itemsPerPage={10} data={TablaInicial} />
                </div>
            </div>

            {/* Contenedor para el editor de SQL - Diseño moderno */}
            <div className='ContenidoB p-4 rounded-lg shadow bg-base-200'>
                <div className='h-[70%]'>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">

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
            <div className='ContenidoC p-4 rounded-lg shadow bg-base-200'>
                <div className="flex items-center gap-3 mb-4">

                    <h3 className="text-xl font-bold text-info">Información del Ejercicio</h3>
                </div>

                <div className="tabs tabs-lifted h-full overflow-scroll">
                    <input defaultChecked type="radio" name="my_tabs_3" className="tab tab-lifted" aria-label="Problema" />
                    <div className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                        <div className="prose max-w-none">
                            <h4 className="text-lg font-semibold text-accent mb-3">
                                <FaLightbulb className="inline mr-2" />
                                Problema a Resolver
                            </h4>
                            <p className="leading-relaxed text-xs sm:text-sm break-words whitespace-pre-wrap">{ProblemaEjercicio}</p>
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab tab-lifted" aria-label="Resumen" />
                    <div className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                        <div className="prose max-w-none">
                            <h4 className="text-lg font-semibold text-accent mb-3">
                                <FaFile className="inline mr-2" />
                                Resumen del Ejercicio
                            </h4>
                            <p className="leading-relaxed text-xs sm:text-sm break-words whitespace-pre-wrap">{ResumenEjercicio}</p>
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab tab-lifted" aria-label="Contexto DB" />
                    <div className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                        <div className="prose max-w-none">
                            <h4 className="text-lg font-semibold text-accent mb-3">
                                <FaDatabase className="inline mr-2" />
                                Contexto de Base de Datos
                            </h4>
                            <p className="leading-relaxed text-xs sm:text-sm break-words whitespace-pre-wrap">{DatosDB.descripcion}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resultados de ejecución - Diseño moderno */}
            <div className='ContenidoD p-4 rounded-lg shadow bg-base-200'>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">

                        <h3 className="text-xl font-bold text-success">Resultado de Ejecución</h3>
                    </div>
                    <div className='flex flex-row gap-3'>
                        <button onClick={() => CancelarCreacionDERespuesta()} className='btn btn-error shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'>
                            <FaTimes className="mr-2" />
                            Cancelar
                        </button>
                        <button onClick={() => CrearRespuesta()} className='btn btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'>
                            <FaSave className="mr-2" />
                            Guardar Respuesta
                        </button>
                    </div>
                </div>

                <CustomTable itemsPerPage={10} data={TablasSQLResultado} />
            </div>

        </div >
    )
}

export default CrearSolucion