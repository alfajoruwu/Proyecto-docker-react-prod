import './App.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from './Vistas/Login/Login';
import Ejemplo from './Vistas/Ejemplo/Ejemplo';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Ejemplo />} />
        <Route path="/login" element={<Login />} />

      </Routes>
    </BrowserRouter>
  )
}


export default App
