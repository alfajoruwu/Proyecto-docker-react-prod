import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';

import { FaCheckCircle, FaUser, FaStar, FaCode, FaEye, FaTags, FaDatabase, FaRegStar, FaInfoCircle } from 'react-icons/fa';

import './PopUpDatos.css'


const MostrarCartasEjercicio = ({ ListaEjercicios, onActualizarEjercicios, onFiltrarPorDB }) => {
    const { mostrarToast } = useToast();

    const Navigate = useNavigate();

    const { IdEjercicioResolver, SetIdEjercicioResolver, SetterIdEjercicioResolver } = useContext(EstadoGlobalContexto)

    // Función para resolver inmediatamente el ejercicio
    const IrResolverEjercicioDirecto = (ejercicioId) => {
        SetIdEjercicioResolver(ejercicioId || 'placeholder');
        Navigate('/RealizarEjercicio');
    }

    const IrResolverEjercicio = () => {
        if (IdEjercicioResolver == 'placeholder' || IdEjercicioResolver == '') {
            mostrarToast('Debes seleccionar un ejercicio antes de resolverlo', 'error')
            return;
        }
        Navigate('/RealizarEjercicio')
    }

    const [NombreEjercicio, SetNombreEjercicio] = useState('')
    const SetterNombreEjercicio = (event) => {
        SetNombreEjercicio(event.target.value)
    }

    const [ProblemaEjercicio, SetProblemaEjercicio] = useState('')
    const SetterProblemaEjercicio = (event) => {
        SetProblemaEjercicio(event.target.value)
    }

    const [ContextoDB, SetContextoDB] = useState('')
    const SetterContextoDB = (event) => {
        SetContextoDB(event.target.value)
    }

    const [BaseDATOS, SetBaseDATOS] = useState('')
    const SetterBaseDATOS = (event) => {
        SetBaseDATOS(event.target.value)
    }

    const [PermiteIA, SetPermiteIA] = useState('')
    const SetterPermiteIA = (event) => {
        SetPermiteIA(event.target.value)
    }

    const [PermiteRespuesta, SetPermiteRespuesta] = useState('')
    const SetterPermiteRespuesta = (event) => {
        SetPermiteRespuesta(event.target.value)
    }

    const [TopicosEjerccio, SetTopicosEjerccio] = useState([])
    const SetterTopicosEjerccio = (event) => {
        SetTopicosEjerccio(event.target.value)
    }

    // Función para mostrar información del ejercicio en el modal
    const MostrarInfoEjercicio = (ej) => {
        // Setea el ID del ejercicio a resolver
        SetIdEjercicioResolver(ej.id || 'placeholder');
        console.log('Ejercicio a mostrar info:', ej.id || 'placeholder');
        document.getElementById("Resolver-Ejercicios").showModal()
        SetNombreEjercicio(ej.nombre_ej || '')
        SetProblemaEjercicio(ej.problema || '')
        SetContextoDB(ej.contexto_db || '')
        SetBaseDATOS(ej.nombre_basedatos || '')
        SetPermiteIA(ej.permitiria || false)
        SetPermiteRespuesta(ej.permitirsolucion || false);
        SetTopicosEjerccio(ej.topicos || '')
    }

    // Manejar toggle de estrella
    const handleToggleEstrella = async (ejercicioId, event) => {
        event.stopPropagation(); // Evitar que se abra el modal

        try {
            const response = await apiClient.post('/ejericicios/toggle-estrella', {
                ejercicioId
            });

            mostrarToast(response.data.message, 'success', 2000);

            // Actualizar la lista de ejercicios si se proporciona la función
            if (onActualizarEjercicios) {
                onActualizarEjercicios();
            }
        } catch (error) {
            console.error('Error al dar/quitar estrella:', error);
            mostrarToast('Error al procesar la estrella', 'error', 3000);
        }
    };

    // Función para filtrar por base de datos y autor
    const handleFiltrarPorDB = (nombreDB, nombreAutor, event) => {
        event.stopPropagation(); // Evitar otros eventos

        // Guardar en localStorage para persistencia
        localStorage.setItem('filtroDBActivo', JSON.stringify({
            nombreDB: nombreDB,
            nombreAutor: nombreAutor
        }));

        // Llamar al callback del padre para aplicar el filtro
        if (onFiltrarPorDB) {
            onFiltrarPorDB(nombreDB, nombreAutor);
        }

        mostrarToast(`🎯 Mostrando ejercicios de "${nombreDB}" por ${nombreAutor}`, 'info', 3000);
    };




    return (
        <div className='flex flex-row flex-wrap gap-3'>
            {ListaEjercicios && ListaEjercicios.length > 0 ? ListaEjercicios.map((ej) => (
                <div key={ej.id} className="card card-compact w-full md:w-90 bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-[450px]">
                    {/* Header con scroll vertical y max 3 líneas */}
                    <div className="bg-neutral p-3 rounded-t-xl flex-shrink-0 max-h-[90px] min-h-[70px] overflow-y-auto overflow-x-hidden">
                        <div className="flex items-start gap-2">
                            <h2 className="card-title text-base-100 break-words break-all leading-snug flex-1">
                                {ej.nombre_ej || 'Sin nombre'}
                            </h2>
                            <div className="badge badge-accent flex-shrink-0">{{
                                1: 'Fácil',
                                2: 'Intermedio',
                                3: 'Difícil'
                            }[ej.dificultad] || 'Desconocido'}
                            </div>
                        </div>
                    </div>

                    {/* Contenido con scroll de arriba hacia abajo */}
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-end gap-3 flex-shrink-0">
                                {/* Indicador de completado */}
                                {ej.completado && (
                                    <div className="flex items-center gap-1 text-success">
                                        <FaCheckCircle className="text-success flex-shrink-0" />
                                        <span className="font-semibold text-xs">Resuelto</span>
                                    </div>
                                )}
                                {/* Estrellas */}
                                <div className="flex items-center gap-1">
                                    <FaStar className="text-yellow-500 flex-shrink-0" />
                                    <span className="font-semibold">{ej.estrellas || 0}</span>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="flex-shrink-0">
                                <p className="text-gray-700 mb-1"><b>Descripción:</b></p>
                                <div className="max-h-20 overflow-y-auto overflow-x-hidden bg-base-200 rounded p-2">
                                    <p className="break-words break-all whitespace-pre-wrap text-sm">{ej.descripcion || 'Sin descripción'}</p>
                                </div>
                            </div>

                            {/* Topicos */}
                            <div className="flex flex-wrap gap-2 flex-shrink-0">
                                {ej.topicos.map((topico, index) => (
                                    <div key={index}
                                        className="badge badge-outline badge-primary hover:bg-primary hover:text-white transition-colors duration-200 break-all">
                                        {topico}
                                    </div>
                                ))}
                            </div>

                            {/* Estadísticas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <FaUser className="text-info mr-2 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-500">Autor</p>
                                        <p className="font-semibold break-words break-all">{ej.nombre_autor || 'Anónimo'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaDatabase className="text-warning mr-2 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-500">Base de datos</p>
                                        <button
                                            className="font-semibold break-words break-all text-left hover:text-warning hover:underline transition-all duration-200 cursor-pointer bg-transparent border-0 p-0 hover:scale-105 inline-flex items-center gap-1 group"
                                            onClick={(e) => handleFiltrarPorDB(ej.nombre_basedatos, ej.nombre_autor, e)}
                                            title="Click para filtrar ejercicios de esta base de datos y autor"
                                        >
                                            <span className="group-hover:font-bold transition-all">{ej.nombre_basedatos || 'N/A'}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer con botones modernos y responsive */}
                    <div className="card-actions p-4 border-t border-gray-200 flex-shrink-0 flex flex-row gap-2">
                        <button
                            className="btn btn-primary flex-[2] flex items-center justify-center gap-2"
                            onClick={() => IrResolverEjercicioDirecto(ej.id)}
                        >
                            <FaCode className="text-lg flex-shrink-0" /> Resolver
                        </button>
                        <button
                            className="btn btn-outline btn-primary flex-[1] flex items-center justify-center gap-2"
                            onClick={() => MostrarInfoEjercicio(ej)}
                        >
                            <FaInfoCircle className="text-lg flex-shrink-0" /> Info
                        </button>
                        <button
                            className={`btn btn-circle ${ej.tiene_estrella ? 'btn-warning' : 'btn-outline btn-warning'} flex-shrink-0 self-center`}
                            onClick={(e) => handleToggleEstrella(ej.id, e)}
                            title={ej.tiene_estrella ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        >
                            {ej.tiene_estrella ? (
                                <FaStar className="text-xl" />
                            ) : (
                                <FaRegStar className="text-xl" />
                            )}
                        </button>
                    </div>
                </div>
            )) : (
                <div className="text-center w-full py-10">
                    <h3 className="text-lg font-semibold">No hay ejercicios disponibles</h3>
                    <p className="mt-2">Cambia los filtros</p>
                </div>
            )}

            {/* Pop UP */}


            <dialog id="Resolver-Ejercicios" className="modal">
                <div className="modal-box w-[90%] max-w-6xl bg-gradient-to-br from-base-100 to-base-200 shadow-2xl border border-base-300">
                    {/* Header moderno con gradiente */}
                    <div className="bg-gradient-to-r from-primary to-secondary p-6  rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-primary-content mb-2">
                                    Ejercicio preparado
                                </h2>
                                <h3 className="text-lg text-primary-content/90 font-medium">
                                    {NombreEjercicio}
                                </h3>
                            </div>

                        </div>
                    </div>

                    {/* Grid moderno para el contenido */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Problema */}
                        <div className="card bg-gradient-to-br from-info/10 to-info/5 border border-info/20 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="card-body p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                                        <FaEye className="text-xl text-info-content" />
                                    </div>
                                    <h3 className="text-xl font-bold text-info">Problema a Resolver</h3>
                                </div>
                                <div className="bg-base-100 rounded-lg p-4 border-l-4 border-info max-h-60 overflow-y-auto overflow-x-hidden">
                                    <p className="text-base-content leading-relaxed break-words whitespace-pre-wrap">{ProblemaEjercicio}</p>
                                </div>
                            </div>
                        </div>

                        {/* Base de datos */}
                        <div className="card bg-gradient-to-br from-success/10 to-success/5 border border-success/20 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="card-body p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                                        <FaCode className="text-xl text-success-content" />
                                    </div>
                                    <h3 className="text-xl font-bold text-success">Base de Datos: {BaseDATOS}</h3>
                                </div>
                                <div className="bg-base-100 rounded-lg p-4 border-l-4 border-success max-h-60 overflow-y-auto overflow-x-hidden">
                                    <p className="text-base-content leading-relaxed break-words whitespace-pre-wrap">{ContextoDB}</p>
                                </div>
                            </div>
                        </div>

                        {/* Configuraciones */}
                        <div className="card bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="card-body p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center">
                                        <FaTags className="text-xl text-warning-content" />
                                    </div>
                                    <h3 className="text-xl font-bold text-warning">Configuraciones</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-warning/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-warning rounded-full"></div>
                                            <span className="font-medium">Asistencia IA</span>
                                        </div>
                                        <input type="checkbox" checked={PermiteIA} disabled className="toggle toggle-warning toggle-sm" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-warning/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-warning rounded-full"></div>
                                            <span className="font-medium">Ver Solución</span>
                                        </div>
                                        <input type="checkbox" checked={PermiteRespuesta} disabled className="toggle toggle-warning toggle-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Acción principal */}
                        <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="card-body p-6 flex flex-col justify-center items-center text-center">
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                                    <FaCode className="text-2xl text-primary-content" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">¡Comienza Ahora!</h3>
                                <p className="text-base-content/70 mb-6">Pon a prueba tus conocimientos de SQL</p>
                                <button
                                    onClick={() => IrResolverEjercicio()}
                                    className="btn btn-primary btn-lg w-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                >
                                    <FaCode className="mr-2" />
                                    Resolver Ejercicio
                                </button>
                            </div>
                        </div>
                    </div>


                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

        </div>
    );
}

export default MostrarCartasEjercicio;