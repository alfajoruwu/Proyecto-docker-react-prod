

import './Principal.css'

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
const Principal = () => {

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
        ListaTopicosEjercicio, SetListaTopicosEjercicio, SetterListaTopicosEjercicio, ID_Editar_ejercicio, SetID_Editar_ejercicio, SetterID_Editar_ejercicio } = useContext(EstadoGlobalContexto)

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

    const [BuscarTopico, SetBuscarTopico] = useState('')
    const SetterBuscarTopico = (event) => {
        SetBuscarTopico(event.target.value)
    }

    const [OrdenarDificultad, SetOrdenarDificultad] = useState('')
    const SetterOrdenarDificultad = (event) => {
        SetOrdenarDificultad(event.target.value)
    }

    const [FiltrarResueltos, SetFiltrarResueltos] = useState('')
    const SetterFiltrarResueltos = (event) => {
        SetFiltrarResueltos(event.target.value)
    }

    const [FiltrarFavoritos, SetFiltrarFavoritos] = useState('')
    const SetterFiltrarFavoritos = (event) => {
        SetFiltrarFavoritos(event.target.value)
    }

    // Filtro especial para DB + Autor (desde localStorage o desde click en carta)
    const [FiltroDBAutor, SetFiltroDBAutor] = useState(() => {
        const filtroGuardado = localStorage.getItem('filtroDBActivo');
        return filtroGuardado ? JSON.parse(filtroGuardado) : null;
    });

    // --------- Mostrar Elementos --------

    const [ListaBasesDatos, SetListaBasesDatos] = useState([])
    const [cargando, setCargando] = useState(false);
    const [dbIdAEditar, setDbIdAEditar] = useState(null);
    const [EjerciciosDisponibles, SetEjerciciosDisponibles] = useState([])
    const [CargandoEDITAR, SetCargandoEDITAR] = useState(false)

    // Función para filtrar y ordenar ejercicios
    const filteredAndSortedEjercicios = (Array.isArray(EjerciciosDisponibles) ? EjerciciosDisponibles : []).filter(ejercicio => {
        // Filtrar por nombre
        const matchesName = ejercicio?.nombre_ejercicio?.toLowerCase().includes(BuscarDB.toLowerCase()) ||
            ejercicio?.nombre_ej?.toLowerCase().includes(BuscarDB.toLowerCase()) || false;

        // Filtrar por autor
        const matchesAuthor = !BuscarAutor ||
            ejercicio?.autor?.toLowerCase().includes(BuscarAutor.toLowerCase()) ||
            ejercicio?.nombre_autor?.toLowerCase().includes(BuscarAutor.toLowerCase()) || false;

        // Filtrar por tópico
        const matchesTopico = !BuscarTopico ||
            (ejercicio?.topicos && Array.isArray(ejercicio.topicos) &&
                ejercicio.topicos.some(topico => topico.toLowerCase().includes(BuscarTopico.toLowerCase())));

        // Filtrar por ejercicios resueltos
        let matchesResolved = true;
        if (FiltrarResueltos === 'resueltos') {
            matchesResolved = ejercicio?.completado === true;
        } else if (FiltrarResueltos === 'no_resueltos') {
            matchesResolved = ejercicio?.completado === false || ejercicio?.completado === undefined;
        }

        // Filtrar por favoritos (con estrella)
        let matchesFavorito = true;
        if (FiltrarFavoritos === 'favoritos') {
            matchesFavorito = ejercicio?.tiene_estrella === true;
        }

        // Filtrar por DB + Autor (filtro especial desde carta)
        let matchesDBAutor = true;
        if (FiltroDBAutor) {
            matchesDBAutor = ejercicio?.nombre_basedatos === FiltroDBAutor.nombreDB &&
                ejercicio?.nombre_autor === FiltroDBAutor.nombreAutor;
        }

        return matchesName && matchesAuthor && matchesTopico && matchesResolved && matchesFavorito && matchesDBAutor;
    }).sort((a, b) => {
        // Ordenar por dificultad
        if (OrdenarDificultad === 'facil') {
            return (a.dificultad || 0) - (b.dificultad || 0);
        }
        if (OrdenarDificultad === 'dificil') {
            return (b.dificultad || 0) - (a.dificultad || 0);
        }

        return 0;
    });


    // ---------------------------------------

    // Cargar bases de datos
    const cargarBasesDatos = () => {
        apiClient.get('/basedatos/ObtenerDBsPublico')
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


    // Cargar ejercicios con estadísticas
    const CargarEjercicios = () => {
        setCargando(true);
        apiClient.get('/ejericicios/ejercicios-con-stats')
            .then(response => {
                console.log('Ejercicios con stats:', response.data.ejercicios);
                setCargando(false);
                SetEjerciciosDisponibles(response.data.ejercicios);
            })
            .catch(error => {
                console.error('Error al obtener Ejercicios:', error);
                mostrarToast('Error al cargar los Ejercicios', 'error', 3000);
                setCargando(false);
            });
    };

    useEffect(() => {
        CargarEjercicios();
        cargarBasesDatos();
    }, []);

    // Efecto para sincronizar el filtro desde localStorage al volver de resolver ejercicio
    useEffect(() => {
        const verificarFiltroStorage = () => {
            const filtroGuardado = localStorage.getItem('filtroDBActivo');
            if (filtroGuardado) {
                const filtro = JSON.parse(filtroGuardado);
                // Solo actualizar si es diferente al estado actual
                if (JSON.stringify(filtro) !== JSON.stringify(FiltroDBAutor)) {
                    SetFiltroDBAutor(filtro);
                }
            }
        };

        // Verificar al montar y cuando la ventana recibe foco (útil al volver de otra página)
        verificarFiltroStorage();
        window.addEventListener('focus', verificarFiltroStorage);

        return () => {
            window.removeEventListener('focus', verificarFiltroStorage);
        };
    }, []);

    // Función para aplicar filtro de DB + Autor
    const handleFiltrarPorDB = (nombreDB, nombreAutor) => {
        SetFiltroDBAutor({ nombreDB, nombreAutor });
    };

    // Función para limpiar el filtro especial de DB + Autor
    const limpiarFiltroDBAutor = () => {
        SetFiltroDBAutor(null);
        localStorage.removeItem('filtroDBActivo');
        mostrarToast('✅ Filtro eliminado - Mostrando todos los ejercicios', 'success', 2000);
    };

    const SetterCargandoEDITAR = (event) => {
        SetCargandoEDITAR(event.target.value)
    }

    const InicarEjercicio = () => {
        // abrir modal Resolver
        document.getElementById("Resolver-Ejercicios").showModal();
    }



    return (
        <div className='Principal'>

            <div className='Navbar'>
                <Navbar />
            </div>

            <div className='shadow-xl ContenidoA flex flex-col'>

                <div className=' Filtros  gap-3 p-3 flex flex-col'>

                    {/* Filtro activo de DB + Autor */}
                    {FiltroDBAutor && (
                        <div className="border border-primary p-3 rounded-lg flex flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <span className="text-sm font-medium truncate">
                                    Filtrando: <strong>{FiltroDBAutor.nombreDB}</strong> / <strong>{FiltroDBAutor.nombreAutor}</strong>
                                </span>
                            </div>
                            <button
                                onClick={limpiarFiltroDBAutor}
                                className="btn btn-primary btn-xs shrink-0"
                                title="Quitar filtro"
                            >
                                Quitar ✕
                            </button>
                        </div>
                    )}

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

                        {/* Buscar por tópico */}
                        <input
                            type="text"
                            placeholder="Buscar por tópico..."
                            className="flex-1 input input-md"
                            value={BuscarTopico}
                            onChange={SetterBuscarTopico}
                        />
                    </div>

                    <div className='flex flex-row gap-3'>
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
                            <option value="">Estado: Todos</option>
                            <option value="resueltos">Solo resueltos</option>
                            <option value="no_resueltos">No resueltos</option>
                        </select>

                        {/* Filtrar por favoritos */}
                        <select
                            className="flex-1 select"
                            value={FiltrarFavoritos}
                            onChange={SetterFiltrarFavoritos}
                        >
                            <option value="">Favoritos: Todos</option>
                            <option value="favoritos">Solo favoritos</option>
                        </select>

                    </div>

                </div>

                <div className='MostrarDB p-3'>
                    <div className='p-3 text-xl divider'>Ejercicios disponibles</div>
                    {cargando ? (
                        <div className="flex justify-center p-10">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    ) : (
                        <MostrarCartasEjercicio
                            ListaEjercicios={filteredAndSortedEjercicios}
                            resolverEjercicio={InicarEjercicio}
                            onActualizarEjercicios={CargarEjercicios}
                            onFiltrarPorDB={handleFiltrarPorDB}
                        />
                    )}
                </div>



            </div>





        </div>
    )
}

export default Principal