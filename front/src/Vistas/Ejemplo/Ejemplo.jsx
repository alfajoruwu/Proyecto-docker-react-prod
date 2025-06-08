import React from 'react'
import Navbar from '../../Componentes/Navbar'

//Variables glovales
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'

//Uso de toastys
import { useToast } from '../../Componentes/ToastContext'

//Router
import { useNavigate } from "react-router-dom";

//Modo claro/oscuro
import TemaChanger from '../../Componentes/TemaChanger'




const Ejemplo = () => {


    return (
        <div>
            <Navbar />

            <div>
                Swicht de tema
            </div>

            <div className=''>
                Ejemplos de componentes
            </div>


        </div>
    )
}

export default Ejemplo