

import './CrearDB.css'

import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';
import MostrarCartasDB from './MostrarCartasDB';
import FormularioCrearDB from './FormularioCrearDB';
import { FaPlus } from "react-icons/fa";
import FormularioModerno from '../Ejemplo/FormularioModerno';
const CrearDB = () => {

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

    const [ListaBasesDatos, SetListaBasesDatos] = useState([{ Nombre: "SQL Facilito" }, { Nombre: "Banco de ejemplo" }, { Nombre: "SQL Facilito" }, { Nombre: "SQL Facilito" }, { Nombre: "SQL Facilito" }])

    const SetterListaBasesDatos = (event) => {
        SetListaBasesDatos(event.target.value)
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
                    <MostrarCartasDB ListaBasesDatos={ListaBasesDatos} />
                </div>

                <button onClick={() => document.getElementById('Crear_db').showModal()} className='btn btn-primary fixed right-10 bottom-10 w-19 h-19 rounded-full'>
                    <FaPlus />
                </button>

            </div>


            {/* Pop UpS */}
            <dialog id="Crear_db" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <FormularioCrearDB Setcontext={SetContexto} SetResumen={SetResumen} SetNombre={SetNombre} NombreArchivo={NombreArchivo} SeterNombreArchivo={SetNombreArchivo} SQLinicial={SQLinicial} SeterSQLinicial={SetSQLinicial} Nombre={Nombre} Resumen={Resumen} Contexto={Contexto} seterNombreDB={SetterNombre} seterResumen={SetterResumen} seterContexto={SetterContexto} />
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>



        </div>
    )
}

export default CrearDB