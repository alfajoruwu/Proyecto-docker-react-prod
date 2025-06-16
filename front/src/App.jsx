import './App.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProveedorEstadoGlobal } from './AuxS/EstadoGlobal';

import { ToastProvider } from './Componentes/ToastContext';
import Login from './Vistas/Login/Login';
import Ejemplo from './Vistas/Ejemplo/Ejemplo';
import Registro from './Vistas/Login/Registro';
import Principal from './Vistas/Principal/Principal';


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



          </Routes>
        </BrowserRouter>
      </ProveedorEstadoGlobal>


    </ToastProvider>
  )
}


export default App
