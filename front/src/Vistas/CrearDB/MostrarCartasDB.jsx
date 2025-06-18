import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';


const MostrarCartasDB = ({ ListaBasesDatos }) => {

    //Contenido carta

    //Nombre DB
    //Ejercicios Relacionados
    //Resumen



    return (

        <div className='flex flex-row flex-wrap gap-3'>
            {ListaBasesDatos.map((elemento, index) => (
                <div class="card w-80 bg-base-100 card-md shadow-xl">
                    <div class="">
                        <div className='bg-neutral p-3 text-base-100 rounded-xl'>
                            <h2 class=" card-title">{elemento.Nombre}</h2>
                        </div>
                        <div className='card-body'>
                            <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
                            <div class="justify-end card-actions">
                                <button class="btn btn-primary">Buy Now</button>
                            </div>

                        </div>
                    </div>
                </div>
            ))}
        </div>
    )



}

export default MostrarCartasDB