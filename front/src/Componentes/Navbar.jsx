import React, { useContext, useState, useEffect } from 'react'

import { FaUserAlt } from "react-icons/fa";
import { EstadoGlobalContexto } from '../AuxS/EstadoGlobal'
import TemaChanger from './TemaChanger';

import { useToast } from './ToastContext';
import { useNavigate } from 'react-router-dom';


const Navbar = ({ MenuLateral = true }) => {


    const Navigate = useNavigate();
    const { mostrarToast } = useToast();

    const { Nombre, SetNombre } = useContext(EstadoGlobalContexto)
    const { Rol, SetRol } = useContext(EstadoGlobalContexto)

    const nombre = localStorage.getItem('Nombre');
    const rol = localStorage.getItem('Rol');

    useEffect(() => {
        SetNombre(nombre);
        SetRol(rol);
    }, []);

    const Irlogin = () => {
        localStorage.setItem('Nombre', '');
        localStorage.setItem('Rol', '');
        SetNombre('')
        SetRol('')
        mostrarToast('Seccion cerrada con exito', 'success', 3000);
        Navigate('/login')
    }

    const IrCrearBaseDatos = () => { Navigate('/CrearDB') }
    const IrCrearEjercicio = () => { Navigate('/CrearEjercicio') }
    const IrEjercicios = () => { Navigate('/principal') }

    const IrloginSimple = () => { Navigate('/login') }


    return (
        <>
            {/* NavBar */}
            < div class="navbar bg-neutral z-100000 shadow-sm" >
                <div class="flex-none">

                    {MenuLateral &&
                        < div className="drawer ">
                            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                            <div className="drawer-content">
                                <label htmlFor="my-drawer" className="btn btn-primary drawer-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg>
                                </label>
                            </div>

                            <div className="drawer-side">
                                <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                                <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">

                                    <li><a>  <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                                        <div className="drawer-content">
                                            <label htmlFor="my-drawer" className="drawer-button">
                                                <a class="pl-2 text-xl font-bold ">SQL Facilito</a>
                                            </label>
                                        </div></a></li>

                                    <div class="divider"></div>


                                    <li><a onClick={() => IrEjercicios()}>Resolver ejercicios</a></li>

                                    {Nombre != '' &&
                                        <li>
                                            <details className="collapse  border-base-300 ">
                                                <summary className="collapse-title">Crear ejercicios</summary>
                                                <div className="collapse-content text-sm">
                                                    <ul>
                                                        <li>

                                                            <a onClick={() => IrCrearEjercicio()}>Crear nuevo ejercicio</a>
                                                            <a onClick={() => IrCrearBaseDatos()}>Crear base de datos</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </details>
                                        </li>
                                    }
                                    <div class="divider"></div>
                                    <li>
                                        <div className='flex'>
                                            <TemaChanger />
                                        </div>
                                    </li>

                                </ul>
                            </div>
                        </div>
                    }

                </div>

                <div class="flex-1">
                    <a class="pl-2 text-xl font-bold text-base-100">SQL Facilito</a>
                </div>

                {Nombre != '' &&
                    <div class="dropdown text-neutral-content dropdown-end">
                        {Nombre}
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle ">
                            <div class="text-neutral-content rounded-full">
                                <FaUserAlt />
                            </div>
                        </div>
                        <ul
                            tabindex="0"
                            class="menu menu-sm text-black dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            <li onClick={() => Irlogin()}><a>Cerrar secion</a></li>
                        </ul>
                    </div>
                }



            </div >





        </>
    )
}

export default Navbar