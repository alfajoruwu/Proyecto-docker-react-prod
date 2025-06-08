import React, { useContext, useState } from 'react'
import Navbar from '../../Componentes/Navbar';
import { EstadoGlobalContexto } from '../../AuxS/EstadoGlobal'
import { useToast } from '../../Componentes/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../AuxS/Axiosinstance';


const Principal = () => {
    return (
        <div>
            <Navbar />
            <div>Principal</div>
        </div>
    )
}

export default Principal