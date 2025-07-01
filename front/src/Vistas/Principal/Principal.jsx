

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

    const [OrdenarFecha, SetOrdenarFecha] = useState('')
    const SetterOrdenarFecha = (event) => {
        SetOrdenarFecha(event.target.value)
    }

    const [Ordenarpopularidad, SetOrdenarpopularidad] = useState('')
    const SetterOrdenarpopularidad = (event) => {
        SetOrdenarpopularidad(event.target.value)
    }

    // --------- Formulario -----------

    const [Dificultad, SetDificultad] = useState('')
    const SetterDificultad = (event) => {
        SetDificultad(event.target.value)
    }

    // --------- Mostrar Elementos --------

    const [ListaBasesDatos, SetListaBasesDatos] = useState([])
    const [cargando, setCargando] = useState(false);
    const [dbIdAEditar, setDbIdAEditar] = useState(null);

    // ----------------------------------------------

    const [EjerciciosDisponibles, SetEjerciciosDisponibles] = useState('')
    const SetterEjerciciosDisponibles = (event) => {
        SetEjerciciosDisponibles(event.target.value)
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


    // Cargar bases de datos
    const CargarEjercicios = () => {
        setCargando(true);
        apiClient.get('/ejericicios/ObtenerEjercicios_Publico')
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
        CargarEjercicios();
        cargarBasesDatos();
    }, []);

    const [CargandoEDITAR, SetCargandoEDITAR] = useState(false)
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
                    <div className='p-3 text-xl divider'>Ejercicios disponibles</div>
                    {cargando ? (
                        <div className="flex justify-center p-10">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    ) : (
                        <MostrarCartasEjercicio
                            ListaEjercicios={EjerciciosDisponibles}
                            resolverEjercicio={InicarEjercicio}
                        />
                    )}
                </div>



            </div>





        </div>
    )
}

export default Principal