import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';
import { FaRegCalendarAlt, FaTags, FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { formatearFecha } from '../../AuxS/Utilidades';


import './PopUpDatos.css'


const MostrarCartasEjercicio = ({ ListaEjercicios, onEditarDB, onBorrarDB }) => {
    const { mostrarToast } = useToast();

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

    const VerDetalles = (ej) => {
        document.getElementById("Detalles_ejercicios").showModal()
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
                <div key={ej.id} className="card card-compact w-full md:w-90 bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-[400px]">
                    {/* Header con scroll vertical y max 3 líneas */}
                    <div className="bg-neutral p-4 rounded-t-xl flex-shrink-0 max-h-[90px] min-h-[70px] overflow-y-auto overflow-x-hidden">
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
                            {/* Información básica */}
                            <div className="flex-shrink-0">
                                <span className="text-gray-700 font-semibold">Resumen:</span>
                                <div className="max-h-20 overflow-y-auto overflow-x-hidden bg-base-200 rounded p-2 mt-1">
                                    <p className="break-words break-all whitespace-pre-wrap text-sm">{ej.descripcion || 'Sin descripción'}</p>
                                </div>
                            </div>
                            <p className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0 break-all">
                                <FaRegCalendarAlt className="flex-shrink-0" />
                                Creado el: {formatFecha(ej.fecha_creacion)}
                            </p>

                            {/* Topicos con diseño moderno */}
                            <div className="space-y-2 flex-shrink-0">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FaTags className="flex-shrink-0" />
                                    Topicos
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {ej.topicos.map((topico, index) => (
                                        <div key={index}
                                            className="badge badge-outline badge-primary hover:bg-primary hover:text-white transition-colors duration-200 break-all">
                                            {topico}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Zona de acciones responsive */}
                    <div className="p-4 border-t border-gray-200 flex flex-col gap-2 flex-shrink-0">
                        {/* Botón principal */}
                        <button
                            className="btn btn-primary w-full"
                            onClick={() => VerDetalles(ej)}
                        >
                            <FaEye className="mr-2 flex-shrink-0" /> Ver detalles
                        </button>

                        {/* Botones secundarios */}
                        <div className="flex gap-2">
                            <button
                                className="btn btn-secondary btn-outline flex-1"
                                onClick={() => onEditarDB(ej.id)}
                            >
                                <FaEdit className="sm:mr-2 flex-shrink-0" /> <span className="hidden sm:inline">Editar</span>
                            </button>

                            <button
                                className="btn btn-error btn-outline flex-1"
                                onClick={() => {
                                    if (window.confirm(`¿Eliminar "${ej.nombre_ej}"?`)) {
                                        onBorrarDB(ej.id);
                                    }
                                }}
                            >
                                <FaTrashAlt className="sm:mr-2 flex-shrink-0" /> <span className="hidden sm:inline">Borrar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-center w-full py-10">
                    <h3 className="text-lg font-semibold">No hay ejercicios disponibles</h3>
                    <p className="mt-2">Crea un nuevo ejercicio haciendo clic en el botón "+"</p>
                </div>
            )}

            {/* Pop UP */}


            <dialog id="Detalles_ejercicios" className="modal">
                <div className="modal-box w-[90%] max-w-6xl bg-base-100 shadow-2xl border border-base-300 rounded-xl">
                    {/* Header corregido */}
                    <div className="bg-primary p-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-primary-content mb-2">
                                    Detalles del Ejercicio
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
                        <div className="card bg-gradient-to-br from-info/10 to-info/5 border border-info/20 shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-2">
                            <div className="card-body p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                                        <FaEye className="text-xl text-info-content" />
                                    </div>
                                    <h3 className="text-xl font-bold text-info">Enunciado del Problema</h3>
                                </div>
                                <div className="bg-base-100 rounded-lg p-6 border-l-4 border-info max-h-60 overflow-y-auto overflow-x-hidden">
                                    <p className="text-base-content leading-relaxed text-lg break-words whitespace-pre-wrap">{ProblemaEjercicio}</p>
                                </div>
                            </div>
                        </div>

                        {/* Base de datos */}
                        <div className="card bg-gradient-to-br from-success/10 to-success/5 border border-success/20 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="card-body p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                                        <FaTags className="text-xl text-success-content" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-success">Base de Datos</h3>
                                        <p className="text-success/70 font-medium">{BaseDATOS}</p>
                                    </div>
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
                                    <div className="group hover:bg-base-200 transition-colors duration-200 rounded-lg">
                                        <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-warning/30 group-hover:border-warning/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-gradient-to-r from-warning to-warning/70 rounded-full"></div>
                                                <div>
                                                    <span className="font-medium text-base-content">Asistencia IA</span>
                                                    <p className="text-sm text-base-content/60">Permite usar ayuda artificial</p>
                                                </div>
                                            </div>
                                            <input type="checkbox" checked={PermiteIA} disabled className="toggle toggle-warning toggle-sm" />
                                        </div>
                                    </div>
                                    <div className="group hover:bg-base-200 transition-colors duration-200 rounded-lg">
                                        <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-warning/30 group-hover:border-warning/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-gradient-to-r from-warning to-warning/70 rounded-full"></div>
                                                <div>
                                                    <span className="font-medium text-base-content">Ver Solución</span>
                                                    <p className="text-sm text-base-content/60">Acceso a la respuesta correcta</p>
                                                </div>
                                            </div>
                                            <input type="checkbox" checked={PermiteRespuesta} disabled className="toggle toggle-warning toggle-sm" />
                                        </div>
                                    </div>
                                </div>
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