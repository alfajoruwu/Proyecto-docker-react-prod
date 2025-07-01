
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
                    <h3 className="text-xl font-bold text-primary">Explorar Base de Datos</h3>
                </div>

                <div className="space-y-4">
                    <div className="form-control">
                        <select onChange={manejarCambio} defaultValue="" className="select select-bordered select-primary w-full">
                            <option value="" disabled>Selecciona una tabla</option>
                            {EstructuraDB.length !== 0 && EstructuraDB.map((tabla, index) => (
                                <option key={index} value={tabla.tablename}>
                                    {tabla.tablename}
                                </option>
                            ))}
                        </select>
                    </div>

                    <CustomTable itemsPerPage={4} data={TablaInicial} />
                </div>
            </div>

            {/* Contenedor para el editor de SQL - Diseño moderno */}
            <div className='ContenidoB p-4 rounded-lg shadow bg-base-200'>
                <div className='h-[80%]'>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                                <FaCode className="text-xl text-secondary-content" />
                            </div>
                            <h3 className="text-xl font-bold text-secondary">Probar Consultas SQL</h3>
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



            {/* Contexto de la DB - Diseño moderno */}
            <div className='ContenidoC p-4 rounded-lg shadow bg-base-200'>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                        <FaEye className="text-xl text-info-content" />
                    </div>
                    <h3 className="text-xl font-bold text-info">Contexto de Base de Datos</h3>
                </div>

                <div className="tabs tabs-lifted h-full overflow-scroll">
                    <input defaultChecked type="radio" name="my_tabs_3" className="tab tab-lifted" aria-label="Contexto DB" />
                    <div className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                        <div className="prose max-w-none">
                            <h4 className="text-lg font-semibold text-accent mb-3">
                                <FaDatabase className="inline mr-2" />
                                Descripción de la Base de Datos
                            </h4>
                            <p className="leading-relaxed">{DatosDB.descripcion}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resultados de ejecución - Diseño moderno */}
            <div className='ContenidoD p-4 rounded-lg shadow bg-base-200'>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                            <FaTable className="text-xl text-success-content" />
                        </div>
                        <h3 className="text-xl font-bold text-success">Resultado de Consulta</h3>
                    </div>
                    <button onClick={() => CancelarCreacionDERespuesta()} className='btn btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'>
                        <FaArrowLeft className="mr-2" />
                        Volver al Menú
                    </button>
                </div>

                <CustomTable itemsPerPage={4} data={TablasSQLResultado} />
            </div>

        </div >
    )
}

export default ProbarDB