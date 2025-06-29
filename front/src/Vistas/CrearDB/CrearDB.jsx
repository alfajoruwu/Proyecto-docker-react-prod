

import './CrearDB.css'

import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';

import apiClient from '../../AuxS/Axiosinstance';
import MostrarCartasDB from './MostrarCartasDB';
import FormularioCrearDB from './FormularioCrearDB';
import { FaPlus } from "react-icons/fa";
import FormularioEditarDB from './FormularioEditarDB';
const CrearDB = () => {

    const { mostrarToast } = useToast();

    // Variables formulario

    // --------- Filtros ---------
    const [BuscarDB, SetBuscarDB] = useState('')
    const SetterBuscarDB = (event) => {
        SetBuscarDB(event.target.value)
    }

    const [OrdenarFecha, SetOrdenarFecha] = useState('')
    const SetterOrdenarFecha = (event) => {
        SetOrdenarFecha(event.target.value)
    }

    const [Ordenarpopularidad, SetOrdenarpopularidad] = useState('')
    const SetterOrdenarpopularidad = (event) => {
        SetOrdenarpopularidad(event.target.value)
    }

    // --------- Formulario -----------
    const [Nombre, SetNombre] = useState('')
    const SetterNombre = (event) => {
        SetNombre(event.target.value)
    }

    const [Resumen, SetResumen] = useState('')
    const SetterResumen = (event) => {
        SetResumen(event.target.value)
    }

    const [Contexto, SetContexto] = useState('')
    const SetterContexto = (event) => {
        SetContexto(event.target.value)
    }



    // --------- Mostrar Elementos --------

    const [ListaBasesDatos, SetListaBasesDatos] = useState([])
    const [cargando, setCargando] = useState(false);
    const [dbIdAEditar, setDbIdAEditar] = useState(null);

    // --------- Archivos ------------

    const [SQLinicial, SetSQLinicial] = useState('')
    const SetterSQLinicial = (event) => {
        SetSQLinicial(event.target.value)
    }

    const [NombreArchivo, SetNombreArchivo] = useState('')
    const SetterNombreArchivo = (event) => {
        SetNombreArchivo(event.target.value)
    }

    // Cargar bases de datos
    const cargarBasesDatos = () => {
        setCargando(true);
        apiClient.get('/basedatos/ObtenerDBs')
            .then(response => {
                console.log('Base de datos obtenidas:', response.data);
                if (response.data && response.data.DB && response.data.DB.rows) {
                    SetListaBasesDatos(response.data.DB.rows);
                }
                setCargando(false);
            })
            .catch(error => {
                console.error('Error al obtener bases de datos:', error);
                mostrarToast('Error al cargar las bases de datos', 'error', 3000);
                setCargando(false);
            });
    };

    useEffect(() => {
        cargarBasesDatos();
    }, []);

    // Manejar la edición de una base de datos
    const handleEditarDB = (id) => {

        apiClient.get('/basedatos/ObtenerDB/' + id)
            .then(response => {
                console.log('Base de datos elegida:', response.data.db);
                SetNombre(response.data.db.nombre);
                SetResumen(response.data.db.resumen);
                SetContexto(response.data.db.descripcion);
                SetSQLinicial(response.data.db.sql_init);
                SetNombreArchivo('SQL guardado');
                setDbIdAEditar(id);
            })

            .catch(error => { console.error('Error al obtener usuarios:', error); });

        document.getElementById('Editar_db').showModal();
    };

    // Manejar el borrado de una base de datos
    const handleBorrarDB = (id) => {
        setCargando(true);
        apiClient.delete(`/basedatos/BorrarDB/${id}`)
            .then(response => {
                console.log('Base de datos eliminada:', response.data);
                mostrarToast('Base de datos eliminada correctamente', 'success', 3000);
                cargarBasesDatos(); // Recargar la lista
            })
            .catch(error => {
                console.error('Error al eliminar base de datos:', error);
                mostrarToast(error.response?.data?.error || 'Error al eliminar la base de datos', 'error', 3000);
                setCargando(false);
            });
    };

    return (
        <div className='CrearDB'>

            <div className='Navbar'>
                <Navbar />
            </div>

            <div className='shadow-xl ContenidoA flex flex-col'>

                <div className=' Filtros h-30  gap-3 p-3 flex flex-col'>

                    {/* ingreso de busqueda nombre */}
                    <input type="text" placeholder="Buscar bases de datos" class="w-full input input-md" />

                    <div className='flex flex-row gap-3'>
                        {/* Invgreso de  */}
                        <select class=" flex-1 select">
                            <option disabled selected>Ordenar por fecha</option>
                            <option>Mas reciente</option>
                            <option>Mas antiguo</option>
                            <option>XD</option>
                        </select>

                        <select class=" flex-1 select">
                            <option disabled selected>Ordenar </option>
                            <option>Chrome</option>
                            <option>FireFox</option>
                            <option>Safari</option>
                        </select>

                    </div>

                </div>

                <div className='MostrarDB p-3'>
                    <div className='p-3 text-xl divider'>Bases de datos creadas</div>
                    {cargando ? (
                        <div className="flex justify-center p-10">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    ) : (
                        <MostrarCartasDB
                            ListaBasesDatos={ListaBasesDatos}
                            onEditarDB={handleEditarDB}
                            onBorrarDB={handleBorrarDB}
                        />
                    )}
                </div>

                <button onClick={() => document.getElementById('Crear_db').showModal()} className='btn btn-primary fixed right-10 bottom-10 w-19 h-19 rounded-full'>
                    <FaPlus />
                </button>

            </div>


            {/* Pop UpS */}
            <dialog id="Crear_db" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <FormularioCrearDB
                        Setcontext={SetContexto}
                        SetResumen={SetResumen}
                        SetNombre={SetNombre}
                        NombreArchivo={NombreArchivo}
                        SeterNombreArchivo={SetNombreArchivo}
                        SQLinicial={SQLinicial}
                        SeterSQLinicial={SetSQLinicial}
                        Nombre={Nombre}
                        Resumen={Resumen}
                        Contexto={Contexto}
                        seterNombreDB={SetterNombre}
                        seterResumen={SetterResumen}
                        seterContexto={SetterContexto}
                        onCreateSuccess={cargarBasesDatos}
                    />
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <dialog id="Editar_db" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <FormularioEditarDB
                        dbId={dbIdAEditar}
                        Setcontext={SetContexto}
                        SetResumen={SetResumen}
                        SetNombre={SetNombre}
                        NombreArchivo={NombreArchivo}
                        SeterNombreArchivo={SetNombreArchivo}
                        SQLinicial={SQLinicial}
                        SeterSQLinicial={SetSQLinicial}
                        Nombre={Nombre}
                        Resumen={Resumen}
                        Contexto={Contexto}
                        seterNombreDB={SetterNombre}
                        seterResumen={SetterResumen}
                        seterContexto={SetterContexto}
                        onEditSuccess={cargarBasesDatos}
                    />
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>



        </div>
    )
}

export default CrearDB