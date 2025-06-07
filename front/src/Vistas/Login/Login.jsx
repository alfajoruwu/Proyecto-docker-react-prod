import React from 'react'

const Login = () => {
    return (
        <>

            <div>
                Navbar
            </div>

            <div className='min-h-screen flex items-center justify-center'>

                <div className='card bg-base-200 card-lg'>
                    <div className='card-body'>

                        <h2 className='card-title'>Iniciar Sesión </h2>

                        <input className='input' placeholder='Correo' type="text" />

                        <input className='input' placeholder='Contraseña' type="password" />

                        <button className="btn btn-neutral">Iniciar sesión</button>

                    </div>
                </div>

            </div>
        </>
    )
}

export default Login