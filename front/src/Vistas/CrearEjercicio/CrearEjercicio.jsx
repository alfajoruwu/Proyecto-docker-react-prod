import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';

import './CrearEjercicio.css'
import FormularioModerno from '../Ejemplo/FormularioModerno';


const CrearEjercicio = () => {
    return (
        <>
            <Navbar />
            <FormularioModerno />

        </>
    )
}

export default CrearEjercicio