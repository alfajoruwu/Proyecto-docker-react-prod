import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';

import { formatearFecha } from '../../AuxS/Utilidades';
import { FaRegCalendar, FaCheckCircle, FaUser, FaStar, FaCode } from 'react-icons/fa';

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
                <div key={ej.id} className="card card-compact w-full md:w-90 bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    {/* Header con gradiente */}
                    <div className="bg-neutral  p-3 rounded-t-xl">
                        <h2 className="card-title text-base-100">
                            {ej.nombre_ej || 'Sin nombre'}
                            <div className="badge badge-accent ml-2">{{
                                1: 'Fácil',
                                2: 'Intermedio',
                                3: 'Difícil'
                            }[ej.dificultad] || 'Desconocido'}
                            </div>
                        </h2>
                    </div>

                    {/* Contenido con scroll suave */}
                    <div className="card-body overflow-y-auto max-h-64 p-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <p><FaRegCalendar className="inline mr-1" /> {formatFecha(ej.fecha_creacion)}</p>
                            <div className="flex items-center">
                                <FaStar className="text-yellow-500 mr-1" /> {ej.estrellas || 0}
                            </div>
                        </div>

                        <p className="text-gray-700 mb-3"><b>Descripción:</b> {ej.descripcion || 'Sin descripción'}</p>

                        {/* Topicos con animación */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {ej.topicos.map((topico, index) => (
                                <div key={index}
                                    className="badge badge-outline badge-primary hover:bg-primary hover:text-white transition-colors duration-200">
                                    {topico}
                                </div>
                            ))}
                        </div>

                        {/* Estadísticas con iconos */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center">
                                <FaCheckCircle className="text-success mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Completados</p>
                                    <p className="font-semibold">{ej.veces_completado || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <FaUser className="text-info mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Autor</p>
                                    <p className="font-semibold">{ej.nombre_autor || 'Anónimo'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer con botones modernos */}
                    <div className="card-actions p-4 border-t border-gray-200">
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
                <div className="modal-box  w-[80%] max-w-5xl flex flex-col gap-5">

                    <h2 className='text-xl'>{'Titulo: ' + NombreEjercicio}</h2>
                    <div className='PopUpDatos'>
                        <div className='elementoA card  shadow-xl bg-base-100'>
                            <h2 className='bg-primary rounded-xl p-3 text-primary-content'>Problema</h2>
                            <div>
                                <p className='p-3'>{ProblemaEjercicio}</p>
                            </div>
                        </div>

                        <div className='elementoB card  shadow-xl bg-base-100'>
                            <h2 className='bg-primary rounded-xl p-3 text-primary-content'>Base de datos: {BaseDATOS}</h2>
                            <div>
                                <p className='p-3'>{ContextoDB}</p>
                            </div>
                        </div>

                        <div className='elementoC card  shadow-xl bg-base-100'>
                            <h2 className='bg-primary rounded-xl p-3 text-primary-content'>Extras</h2>
                            <div className='flex flex-col p-2 gap-3'>
                                <div className='p-3 flex flex-row justify-between gap-2 border border-dotted-1 border-primary rounded-lg'>
                                    <label > Permite IA </label>
                                    <input type="checkbox" checked={PermiteIA} disabled className="toggle toggle-primary" />
                                </div>

                                <div className='p-3 flex flex-row justify-between gap-2 border border-dotted-1 border-primary rounded-lg'>
                                    <label > Permite ver la solucion </label>
                                    <input type="checkbox" checked={PermiteRespuesta} disabled className="toggle toggle-primary" />
                                </div>

                            </div>
                        </div>

                        <div className='elementoD card  shadow-xl bg-base-100'>
                            <h2 className='bg-primary rounded-xl p-3 text-primary-content'>Intentar Resolver</h2>
                            <div className='flex p-3'>
                                <button onClick={() => IrResolverEjercicio()} className='btn btn-primary flex-1'>Resolver ejercicio!</button>
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