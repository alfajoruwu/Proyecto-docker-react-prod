import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext'
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';

//Modo claro/oscuro
import TemaChanger from '../../Componentes/TemaChanger'


const Login = () => {

    const Navigate = useNavigate();
    const { mostrarToast } = useToast();
    const { valorGlobal, setValorGlobal } = useContext(EstadoGlobalContexto)

    // ----- Navegar Rutas -----

    const IrRegistro = () => { Navigate('/Registro') }
    const IrLogin = () => { Navigate('/Login') }
    const Irprincipal = () => { Navigate('/') }
    // ----- Variables -------

    const [Usuario, SetUsuario] = useState("")
    const seterUsuario = (event) => {
        SetUsuario(event.target.value)
    }

    const [Contrasna, SetContrasena] = useState("")
    const seterContrasena = (event) => {
        SetContrasena(event.target.value)
    }

    // ----- Funciones ------

    const EnvioLogin = (Usuario, Contrasena) => {
        apiClient.post('/usuarios/login', { email: Usuario, password: Contrasena })

            .then(response => {
                //console.log('Usuarios:', response.data); 
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                Irprincipal();
            })

            .catch(error => {
                console.error('Error del backend:', error.response.data.error);
                mostrarToast("Error: " + error.response.data.error, 'error', 3000);
            });
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

                    <div className='card-body flex flex-col gap-2'>

                        <div className='flex '>
                            <h1 className="text-2xl font-bold" >SQL Faciltio</h1>
                        </div>

                        <div class="divider"></div>

                        <h2 className='card-title'>Iniciar Sesión</h2>

                        <label>Ingresa tu correo</label>
                        <input onChange={seterUsuario} className='input w-full' placeholder='Correo' type="text" />

                        <label>Ingresa tu contraseña</label>
                        <input onChange={seterContrasena} className='input w-full' placeholder='Contraseña' type="password" />

                        <button onClick={() => EnvioLogin(Usuario, Contrasna)} className="btn btn-primary">Iniciar sesión</button>

                        <div class="divider"></div>

                        <button onClick={() => IrRegistro()} className="btn btn-secondary">Crear cuenta</button>
                        <button className="btn btn-secondary">Ingresar como invitado    </button>


                    </div>
                </div>

            </div>

        </div>
    )
}

export default Login