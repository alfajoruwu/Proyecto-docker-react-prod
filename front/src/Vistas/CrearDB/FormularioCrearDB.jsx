import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';


const FormularioCrearDB = ({ Nombre, Resumen, Contexto, seterNombreDB, seterResumen, seterContexto }) => {


    const CrearDB = (Nombre, Resumen, Contexto) => {
        apiClient.post('/basedatos/CrearDB', { dbName: Nombre, Descripcion: Contexto, Resumen: Resumen })
            .then(response => { console.log('resultado:', response.data); mostrarToast(response.data.message, 'success', 3000); })
            .catch(error => { console.error('Error del backend:', error.response.data.error); mostrarToast(error.response.data.error, 'error', 3000); });
    }

    return (
        <div className='p-4 gap-6 flex flex-col'>

            <h1 class="text-2xl font-bold mb-6 text-center">Crear base de datos</h1>

            <div>
                <label className='label'>Nombre de la base de datos</label>
                <input onChange={seterNombreDB} type="text" placeholder="Nombre de base de datos" class="input w-full " />
            </div>

            <div className='flex flex-col'>
                <label className='label'>Resumen</label>
                <textarea onChange={seterResumen} class="textarea w-full" placeholder="Pequeña descripcion de la base de datos"></textarea>
            </div>

            <div className='flex flex-col'>
                <label className='label'>Contexto</label>
                <textarea onChange={seterContexto} class="textarea w-full" placeholder="En que consiste la base de datos"></textarea>
            </div>

            <div className='flex flex-wrap gap-3 w-full'>
                <button onClick={() => document.getElementById('Subir_Archivo').showModal()} className='btn btn-primary flex-1 min-w-[150px]'>Subir archivo</button>
                <button onClick={() => document.getElementById('EditarSQL').showModal()} className='btn btn-primary flex-1 min-w-[150px]'>Editar SQL inicial</button>
            </div>

            <div className='flex flex-wrap flex-row w-[100%] gap-3'>
                <button onClick={() => CrearDB(Nombre, Resumen, Contexto)} className='btn flex-3 btn-success'>Crear nueva base de datos</button>
                <button className='btn flex-1 btn-error'>Limpiar formulario</button>
            </div>



            {/* POP-UPS */}

            <dialog id="Subir_Archivo" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Hello!</h3>
                    <p className="py-4">Subir archivo</p>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>


            <dialog id="EditarSQL" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Hello!</h3>
                    <p className="py-4">Editar SQL</p>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

        </div>



    )
}

export default FormularioCrearDB