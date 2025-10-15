

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

    // --------- Mostrar Elementos --------
    const [ListaBasesDatos, SetListaBasesDatos] = useState([])
    const [cargando, setCargando] = useState(false);
    const [dbIdAEditar, setDbIdAEditar] = useState(null);

    // Función para filtrar y ordenar las bases de datos
    const filteredAndSortedBasesDatos = ListaBasesDatos.filter(db => {
        // Filtrar por nombre
        const matchesName = db.nombre?.toLowerCase().includes(BuscarDB.toLowerCase()) || false;
        return matchesName;
    }).sort((a, b) => {
        // Ordenar por fecha
        if (OrdenarFecha === 'reciente') {
            return new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0);
        }
        if (OrdenarFecha === 'antiguo') {
            return new Date(a.fecha_creacion || 0) - new Date(b.fecha_creacion || 0);
        }

        // Ordenar por popularidad (número de usos)
        if (Ordenarpopularidad === 'popular') {
            return (b.usos || 0) - (a.usos || 0);
        }
        if (Ordenarpopularidad === 'impopular') {
            return (a.usos || 0) - (b.usos || 0);
        }

        return 0;
    });

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
                    <input
                        type="text"
                        placeholder="Buscar bases de datos por nombre..."
                        className="w-full input input-md"
                        value={BuscarDB}
                        onChange={SetterBuscarDB}
                    />

                    <div className='flex flex-row gap-3'>
                        {/* Ordenar por fecha */}
                        <select
                            className="flex-1 select"
                            value={OrdenarFecha}
                            onChange={SetterOrdenarFecha}
                        >
                            <option value="" disabled>Ordenar por fecha</option>
                            <option value="reciente">Más reciente</option>
                            <option value="antiguo">Más antiguo</option>
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
                            ListaBasesDatos={filteredAndSortedBasesDatos}
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