import './App.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProveedorEstadoGlobal } from './AuxS/EstadoGlobal';

import { ToastProvider } from './Componentes/ToastContext';
import Login from './Vistas/Login/Login';
import Ejemplo from './Vistas/Ejemplo/Ejemplo';
import Registro from './Vistas/Login/Registro';
import Principal from './Vistas/Principal/Principal';
import CrearDB from './Vistas/CrearDB/CrearDB';
import CrearEjercicio from './Vistas/CrearEjercicio/CrearEjercicio';
import CrearSolucion from './Vistas/EjecucionSQL/CrearSolucion';
import ProbarDB from './Vistas/EjecucionSQL/ProbarDB';
import RealizarEjercicio from './Vistas/EjecucionSQL/RealizarEjercicio';


function App() {

  return (
    <ToastProvider>

      <ProveedorEstadoGlobal>
        <BrowserRouter>
          <Routes>

            <Route path="/" element={<Principal />} />

            {/* Inicio de seccion */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            {/* Principal */}
            <Route path="/principal" element={<Principal />} />

            {/* Crear ejercicios */}

            <Route path='/CrearEjercicio' element={<CrearEjercicio />} />
            <Route path='/CrearDB' element={<CrearDB />} />


            {/* ejecucion de SQL */}
            <Route path='/CrearSolucion' element={<CrearSolucion />} />
            <Route path='/ProbarDB' element={<ProbarDB />} />
            <Route path='/RealizarEjercicio' element={<RealizarEjercicio />} />

            {/* Rutas de ejemplo */}

          </Routes>
        </BrowserRouter>
      </ProveedorEstadoGlobal>


    </ToastProvider>
  )
}


export default App
