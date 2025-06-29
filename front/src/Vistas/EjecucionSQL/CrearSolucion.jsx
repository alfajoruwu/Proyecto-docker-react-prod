
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

const CrearSolucion = ({ }) => {

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
        ListaTopicosEjercicio, SetListaTopicosEjercicio, SetterListaTopicosEjercicio } = useContext(EstadoGlobalContexto)

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
                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Problema" />
                    <div className="tab-content bg-base-100 border-base-300 p-6">{ProblemaEjercicio}</div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Resumen" defaultChecked />
                    <div className="tab-content bg-base-100 border-base-300 p-6">{ResumenEjercicio}</div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Contexto DB" />
                    <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 3</div>
                </div>
            </div>



            <div className='ContenidoD p-4 rounded-lg shadow bg-base-200'>
                <div className='flex flex-row justify-between p-3 gap-3'>
                    <label className='label'> Resultado ejecucion </label>
                    <div className='flex flex-row gap-3'>
                        <button onClick={() => CancelarCreacionDERespuesta()} className='btn btn-error  '> Cancelar</button>
                        <button onClick={() => CrearRespuesta()} className='btn btn-primary'> Guardar respuesta</button>
                    </div>
                </div>
                <CustomTable itemsPerPage={4} data={TablasSQLResultado} />

            </div>

        </div >
    )
}

export default CrearSolucion