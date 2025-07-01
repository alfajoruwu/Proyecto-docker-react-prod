

import './CrearEjercicio.css'

import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';

import apiClient from '../../AuxS/Axiosinstance';
import MostrarCartasEjercicio from './MostrarCartasEjercicio';
import FormularioCrearEjercicio from './FormularioCrearEjercicio';
import { FaPlus } from "react-icons/fa";
import FormularioEditarEjercicio from './FormularioEditarEjercicio';

const CrearEjercicio = () => {

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
        ListaTopicosEjercicio, SetListaTopicosEjercicio, SetterListaTopicosEjercicio, ID_Editar_ejercicio, SetID_Editar_ejercicio, SetterID_Editar_ejercicio,
        MODOEDITAR, SetMODOEDITAR, SetterMODOEDITAR,


    } = useContext(EstadoGlobalContexto)

    const { Solucion, SetSolucion, SetterSolucion } = useContext(EstadoGlobalContexto)

    // Variables formulario

    // --------- Filtros ---------
    const [BuscarDB, SetBuscarDB] = useState('')
    const SetterBuscarDB = (event) => {
        SetBuscarDB(event.target.value)
    }

    const [BuscarAutor, SetBuscarAutor] = useState('')
    const SetterBuscarAutor = (event) => {
        SetBuscarAutor(event.target.value)
    }

    const [OrdenarFecha, SetOrdenarFecha] = useState('')
    const SetterOrdenarFecha = (event) => {
        SetOrdenarFecha(event.target.value)
    }

    const [OrdenarDificultad, SetOrdenarDificultad] = useState('')
    const SetterOrdenarDificultad = (event) => {
        SetOrdenarDificultad(event.target.value)
    }

    const [FiltrarResueltos, SetFiltrarResueltos] = useState('')
    const SetterFiltrarResueltos = (event) => {
        SetFiltrarResueltos(event.target.value)
    }

    // --------- Mostrar Elementos --------

    const [ListaBasesDatos, SetListaBasesDatos] = useState([])
    const [cargando, setCargando] = useState(false);
    const [dbIdAEditar, setDbIdAEditar] = useState(null);

    // ----------------------------------------------

    const [EjerciciosDisponibles, SetEjerciciosDisponibles] = useState([])

    // Función para filtrar y ordenar ejercicios
    const filteredAndSortedEjercicios = (Array.isArray(EjerciciosDisponibles) ? EjerciciosDisponibles : []).filter(ejercicio => {
        // Filtrar por nombre
        const matchesName = ejercicio?.nombre_ejercicio?.toLowerCase().includes(BuscarDB.toLowerCase()) ||
            ejercicio?.nombre_ej?.toLowerCase().includes(BuscarDB.toLowerCase()) || false;

        // Filtrar por autor
        const matchesAuthor = !BuscarAutor ||
            ejercicio?.autor?.toLowerCase().includes(BuscarAutor.toLowerCase()) ||
            ejercicio?.nombre_autor?.toLowerCase().includes(BuscarAutor.toLowerCase()) || false;

        // Filtrar por ejercicios resueltos
        let matchesResolved = true;
        if (FiltrarResueltos === 'resueltos') {
            matchesResolved = ejercicio?.resuelto === true || ejercicio?.completado === true;
        } else if (FiltrarResueltos === 'no_resueltos') {
            matchesResolved = ejercicio?.resuelto === false || ejercicio?.completado === false ||
                !ejercicio?.resuelto && !ejercicio?.completado;
        }

        return matchesName && matchesAuthor && matchesResolved;
    }).sort((a, b) => {
        // Ordenar por fecha
        if (OrdenarFecha === 'reciente') {
            return new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0);
        }
        if (OrdenarFecha === 'antiguo') {
            return new Date(a.fecha_creacion || 0) - new Date(b.fecha_creacion || 0);
        }

        // Ordenar por dificultad
        if (OrdenarDificultad === 'facil') {
            return (a.dificultad || 0) - (b.dificultad || 0);
        }
        if (OrdenarDificultad === 'dificil') {
            return (b.dificultad || 0) - (a.dificultad || 0);
        }

        return 0;
    });

    // --------- Formulario -----------

    const [Dificultad, SetDificultad] = useState('')
    const SetterDificultad = (event) => {
        SetDificultad(event.target.value)
    }

    // ---------------------------------------

    // Cargar bases de datos
    const cargarBasesDatos = () => {
        apiClient.get('/basedatos/ObtenerDBs')
            .then(response => {
                console.log('Base de datos obtenidas:', response.data);
                SetListaBasesDatos(response.data.DB.rows);
                console.log('Cantidad de bases de datos:', response.data.DB.rows);
            })
            .catch(error => {
                console.error('Error al obtener bases de datos:', error);
                mostrarToast('Error al cargar las bases de datos', 'error', 3000);
            });
        console.log(ListaBasesDatos)
    };

    // Cargar ejercicios
    const CargarEjercicios = () => {
        setCargando(true);
        apiClient.get('/ejericicios/ObtenerEjercicios')
            .then(response => {
                console.log('Ejercicios:', response.data.ejercicios);
                setCargando(false);
                SetEjerciciosDisponibles(response.data.ejercicios);
            })
            .catch(error => {
                console.error('Error al obtener Ejercicios:', error);
                mostrarToast('Error al cargar las Ejercicios', 'error', 3000);
                setCargando(false);
            });
        console.log(ListaBasesDatos)
    };

    useEffect(() => {
        if (MODOEDITAR == 'Crear') {
            document.getElementById('Crear_db').showModal()
            SetMODOEDITAR('') // Resetear modo editar
        };

        if (MODOEDITAR == 'Editar') {
            document.getElementById('Editar_db').showModal()
            SetMODOEDITAR('') // Resetear modo editar
        };

        CargarEjercicios();
        cargarBasesDatos();
    }, []);

    const [CargandoEDITAR, SetCargandoEDITAR] = useState(false)
    const SetterCargandoEDITAR = (event) => {
        SetCargandoEDITAR(event.target.value)
    }

    const BorrarEjercicio = (idEjercico) => {
        setCargando(true);
        apiClient.delete('/ejericicios/BorrarEjercicio/' + idEjercico)
            .then(response => {
                console.log('Ejercicio eliminado:', response.data);
                mostrarToast('Ejercicio eliminado correctamente', 'success', 3000);
                CargarEjercicios(); // Recargar la lista
            })
            .catch(error => {
                console.error('Error al eliminar base de datos:', error);
                mostrarToast(error.response?.data?.error || 'Error al eliminar la base de datos', 'error', 3000);
                setCargando(false);
            });
    }

    const EditarEjercicio = (id_ejercicio) => {
        SetID_Editar_ejercicio(id_ejercicio);
        SetCargandoEDITAR(true)
        // Setear datos del ejercicio a editar
        apiClient.get('/ejericicios/ObtenerEjercicio/' + id_ejercicio)
            .then(response => {

                console.log('ejercicio:', response.data);
                SetNombreEjercicio(response.data.ejercicio.nombre_ej);
                SetProblemaEjercicio(response.data.ejercicio.problema);
                SetResumenEjercicio(response.data.ejercicio.descripcion);
                SetDificultadEjercicio(response.data.ejercicio.dificultad);
                SetPermitirIAEjercicio(response.data.ejercicio.permitiria);
                SetVerRespuestaEsperada(response.data.ejercicio.permitirsolucion);
                IDSetDBSeleccionadaEjercicio(response.data.ejercicio.id_basedatos);
                SetSolucionEjercicio(response.data.ejercicio.sql_solucion);
                console.log("Tabla" + response.data.Tablas)
                SetTablaSolucionEjercicio(response.data.Tablas);
                setTopicosSeleccionados(response.data.ejercicio.topicos);
                SetCargandoEDITAR(false)
            })
            .catch(error => { console.error('Error al obtener ejercicio:', error); });

        document.getElementById('Editar_db').showModal();

        console.log("Mostrar formulario")
        console.log("Nombre del ejercicio: ", NombreEjercicio)
        console.log("Resumen del ejercicio: ", ResumenEjercicio)
        console.log("Problema del ejercicio: ", ProblemaEjercicio)
        console.log("Dificultad del ejercicio: ", DificultadEjercicio)
        console.log("Permitir IA: ", PermitirIAEjercicio)
        console.log("Ver respuesta esperada: ", VerRespuestaEsperada)
        console.log("ID de la base de datos seleccionada: ", IDDBSeleccionadaEjercicio)
        console.log("Solucion del ejercicio: ", SolucionEjercicio)
        console.log("Tabla de solucion del ejercicio: ", JSON.parse(TablaSolucionEjercicio))
        console.log("Topicos seleccionados: ", topicosSeleccionados)


        // Establecer el ID del ejercicio a editar

    }

    return (
        <div className='CrearEjercicio'>

            <div className='Navbar'>
                <Navbar />
            </div>

            <div className='shadow-xl ContenidoA flex flex-col'>

                <div className=' Filtros h-30  gap-3 p-3 flex flex-col'>

                    <div className='flex flex-row gap-3'>
                        {/* Buscar por nombre */}
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            className="flex-1 input input-md"
                            value={BuscarDB}
                            onChange={SetterBuscarDB}
                        />

                        {/* Buscar por autor */}
                        <input
                            type="text"
                            placeholder="Buscar por autor..."
                            className="flex-1 input input-md"
                            value={BuscarAutor}
                            onChange={SetterBuscarAutor}
                        />
                    </div>

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

                        {/* Ordenar por dificultad */}
                        <select
                            className="flex-1 select"
                            value={OrdenarDificultad}
                            onChange={SetterOrdenarDificultad}
                        >
                            <option value="" disabled>Ordenar por dificultad</option>
                            <option value="facil">Más fácil</option>
                            <option value="dificil">Más difícil</option>
                        </select>

                        {/* Filtrar ejercicios resueltos */}
                        <select
                            className="flex-1 select"
                            value={FiltrarResueltos}
                            onChange={SetterFiltrarResueltos}
                        >
                            <option value="" disabled>Estado de resolución</option>
                            <option value="">Todos</option>
                            <option value="resueltos">Solo resueltos</option>
                            <option value="no_resueltos">No resueltos</option>
                        </select>

                    </div>

                </div>

                <div className='MostrarDB p-3'>
                    <div className='p-3 text-xl divider'>Ejercicios creados</div>
                    {cargando ? (
                        <div className="flex justify-center p-10">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    ) : (
                        <MostrarCartasEjercicio
                            ListaEjercicios={filteredAndSortedEjercicios}
                            onEditarDB={EditarEjercicio}
                            onBorrarDB={BorrarEjercicio}
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
                    <FormularioCrearEjercicio
                        listaDB={ListaBasesDatos}
                        SetterDificultad={SetterDificultad}
                        Dificultad={Dificultad}
                        Solucion={Solucion}
                        ListaEjercicios={EjerciciosDisponibles}
                        ActualizarEjercicios={CargarEjercicios}
                    />
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <dialog id="Editar_db" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <FormularioEditarEjercicio
                        listaDB={ListaBasesDatos}
                        SetterDificultad={SetterDificultad}
                        Dificultad={Dificultad}
                        Solucion={Solucion}
                        ListaEjercicios={EjerciciosDisponibles}
                        ActualizarEjercicios={CargarEjercicios}
                        CargandoEDITAR={CargandoEDITAR}
                    />
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>



        </div>
    )
}

export default CrearEjercicio