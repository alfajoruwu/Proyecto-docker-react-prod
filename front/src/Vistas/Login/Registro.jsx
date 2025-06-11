import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';


import TemaChanger from '../../Componentes/TemaChanger'


const Registro = () => {

    const Navigate = useNavigate();
    const { mostrarToast } = useToast();
    const { valorGlobal, setValorGlobal } = useContext(EstadoGlobalContexto)

    // ---- Navigate ----

    const IrLogin = () => { Navigate('/Login') }

    // ---- Variables ---

    const [Nombre, SetNombre] = useState('')
    const SetterNombre = (event) => {
        SetNombre(event.target.value)
    }

    const [ConfirmaContrasena, SetConfirmaContrasena] = useState('')
    const SetterConfirmaContrasena = (event) => {
        SetConfirmaContrasena(event.target.value)
    }

    const [Contrasena, SetContrasena] = useState('')
    const SetterContrasena = (event) => {
        SetContrasena(event.target.value)
    }

    const [Correo, SetCorreo] = useState('')
    const SetterCorreo = (event) => {
        SetCorreo(event.target.value)
    }

    // ----- Funciones -----

    const CrearCuenta = (Nombre, ConfirmaContrasena, Contrasena, Correo) => {
        apiClient.post('/usuarios/register', { email: Correo, password: Contrasena, confirmPass: ConfirmaContrasena, nombre: Nombre })
            .then(response => { console.log('Usuarios:', response.data); mostrarToast(response.data.message, 'success', 3000); IrLogin() })
            .catch(error => { console.error('Error del backend:', error.response.data.error); mostrarToast(error.response.data.error, 'error', 3000); });

    }



    return (

        <div className='h-screen w-screen'>

            <Navbar />

            <div className='flex justify-end items-center mr-4 mt-2 gap-2'>
                <label>Modo:</label>
                <TemaChanger />
            </div>

            <div className='flex flex-col items-center justify-center'>

                <div className=' card p-2 w-full sm:max-w-md md:max-w-lg lg:max-w-xl m-12 flex shadow-sm bg-base-200'>

                    <div className='card-body flex flex-col '>

                        <div className='flex '>
                            <h1 className="text-2xl font-bold" >SQL Faciltio</h1>
                        </div>

                        <div class="divider"></div>


                        <h2 className='card-title'>Crea tu cuenta</h2>

                        <label>Ingresa tu nombre</label>
                        <input onChange={SetterNombre} className='input w-full' placeholder='Nombre' type="text" />


                        <label>Ingresa tu correo</label>
                        <input onChange={SetterCorreo} className='input w-full' placeholder='Correo' type="mail" />


                        <label>Ingresa tu contraseña</label>
                        <input onChange={SetterContrasena} className='input w-full' placeholder='Crea tu contraseña' type="password" />


                        <label>Confirma tu contraseña</label>
                        <input onChange={SetterConfirmaContrasena} className='input w-full' placeholder='Confirma Contraseña' type="password" />


                        <button onClick={() => CrearCuenta(Nombre, ConfirmaContrasena, Contrasena, Correo)} className="btn btn-primary">Crear cuenta</button>

                        <div class="divider"></div>

                        <button onClick={() => IrLogin()} className="btn btn-secondary">iniciar secion</button>

                        <button className="btn btn-secondary">Ingresar como invitado    </button>


                    </div>
                </div>

            </div>

        </div>




    )
}

export default Registro