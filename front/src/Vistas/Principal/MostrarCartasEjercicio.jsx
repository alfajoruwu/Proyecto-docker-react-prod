import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';

import { formatearFecha } from '../../AuxS/Utilidades';
import { FaRegCalendar, FaCheckCircle, FaUser, FaStar, FaCode, FaEye, FaTags, FaDatabase } from 'react-icons/fa';

import './PopUpDatos.css'


const MostrarCartasEjercicio = ({ ListaEjercicios }) => {
    const { mostrarToast } = useToast();

    const Navigate = useNavigate();

    const { IdEjercicioResolver, SetIdEjercicioResolver, SetterIdEjercicioResolver } = useContext(EstadoGlobalContexto)

    const IrResolverEjercicio = () => {
        if (IdEjercicioResolver == 'placeholder' || IdEjercicioResolver == '') {
            mostrarToast('Debes seleccionar un ejercicio antes de resolverlo', 'error')
            return;
        }
        Navigate('/RealizarEjercicio')
    }

    // Formatear fecha para mostrar
    const formatFecha = (fechaStr) => {
        if (!fechaStr) return 'Fecha desconocida';
        try {
            return formatearFecha(new Date(fechaStr));
        } catch (error) {
            return fechaStr;
        }
    };


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

    const ResolverEjercicio = (ej) => {
        // Setea el ID del ejercicio a resolver
        SetIdEjercicioResolver(ej.id || 'placeholder');
        console.log('Ejercicio a resolver:', ej.id || 'placeholder');
        document.getElementById("Resolver-Ejercicios").showModal()
        SetNombreEjercicio(ej.nombre_ej || '')
        SetProblemaEjercicio(ej.problema || '')
        SetContextoDB(ej.contexto_db || '')
        SetBaseDATOS(ej.nombre_basedatos || '')
        SetPermiteIA(ej.permitiria || false)
        SetPermiteRespuesta(ej.permitirsolucion || false);
        SetTopicosEjerccio(ej.topicos || '')

    }




    return (
        <div className='flex flex-row flex-wrap gap-3'>
            {ListaEjercicios && ListaEjercicios.length > 0 ? ListaEjercicios.map((ej) => (
                <div key={ej.id} className="card card-compact w-full md:w-90 bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-[450px]">
                    {/* Header con gradiente */}
                    <div className="bg-neutral p-3 rounded-t-xl flex-shrink-0">
                        <h2 className="card-title text-base-100 break-words">
                            <span className="break-words max-w-full">{ej.nombre_ej || 'Sin nombre'}</span>
                            <div className="badge badge-accent ml-2 flex-shrink-0">{{
                                1: 'Fácil',
                                2: 'Intermedio',
                                3: 'Difícil'
                            }[ej.dificultad] || 'Desconocido'}
                            </div>
                        </h2>
                    </div>

                    {/* Contenido sin scroll general */}
                    <div className="card-body flex-1 p-4 min-h-0 flex flex-col">
                        <div className="flex justify-between text-sm text-gray-500 mb-2 flex-shrink-0">
                            <p><FaRegCalendar className="inline mr-1" /> {formatFecha(ej.fecha_creacion)}</p>
                            <div className="flex items-center">
                                <FaStar className="text-yellow-500 mr-1" /> {ej.estrellas || 0}
                            </div>
                        </div>

                        {/* Descripción con su propio scroll */}
                        <div className="mb-3 flex-shrink-0">
                            <p className="text-gray-700 mb-1"><b>Descripción:</b></p>
                            <div className="max-h-24 overflow-y-auto overflow-x-hidden bg-base-200 rounded p-2">
                                <p className="break-words whitespace-pre-wrap text-sm">{ej.descripcion || 'Sin descripción'}</p>
                            </div>
                        </div>

                        {/* Topicos con animación */}
                        <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
                            {ej.topicos.map((topico, index) => (
                                <div key={index}
                                    className="badge badge-outline badge-primary hover:bg-primary hover:text-white transition-colors duration-200">
                                    {topico}
                                </div>
                            ))}
                        </div>

                        {/* Estadísticas con iconos */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center">
                                <FaCheckCircle className="text-success mr-2 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">Completados</p>
                                    <p className="font-semibold">{ej.veces_completado || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <FaUser className="text-info mr-2 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">Autor</p>
                                    <p className="font-semibold break-words">{ej.nombre_autor || 'Anónimo'}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <FaDatabase className="text-warning mr-2 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">Base de datos</p>
                                    <p className="font-semibold break-words">{ej.nombre_basedatos || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer con botones modernos */}
                    <div className="card-actions p-4 border-t border-gray-200 flex-shrink-0">
                        <button className="btn btn-primary btn-wide flex items-center gap-2"
                            onClick={() => ResolverEjercicio(ej)}>
                            <FaCode className="text-lg" /> Resolver
                        </button>
                        <button className="btn btn-circle btn-outline btn-secondary ml-auto"
                            onClick={() => console.log('LIKE')}>
                            <FaStar className="text-xl" />
                        </button>
                    </div>
                </div>
            )) : (
                <div className="text-center w-full py-10">
                    <h3 className="text-lg font-semibold">No hay ejercicios disponibles</h3>
                    <p className="mt-2">Crea un nuevo ejercicio haciendo clic en el botón "+"</p>
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