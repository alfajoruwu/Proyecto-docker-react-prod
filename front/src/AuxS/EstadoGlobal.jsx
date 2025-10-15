import React, { createContext, useState } from 'react';

export const EstadoGlobalContexto = createContext();

export const ProveedorEstadoGlobal = ({ children }) => {

  const [valorGlobal, setValorGlobal] = useState('Valor inicial');

  // Datos usuario
  const [Logeado, SetLogedao] = useState(false)
  const [Nombre, SetNombre] = useState('')
  const [Rol, SetRol] = useState('')


  // formulario ejercicio

  const [NombreEjercicio, SetNombreEjercicio] = useState('')
  const SetterNombreEjercicio = (event) => {
    SetNombreEjercicio(event.target.value)
  }

  const [ResumenEjercicio, SetResumenEjercicio] = useState('')
  const SetterResumenEjercicio = (event) => {
    SetResumenEjercicio(event.target.value)
  }

  const [ProblemaEjercicio, SetProblemaEjercicio] = useState('')
  const SetterProblemaEjercicio = (event) => {
    SetProblemaEjercicio(event.target.value)
  }

  const [DificultadEjercicio, SetDificultadEjercicio] = useState(2)
  const SetterDificultadEjercicio = (event) => {
    SetDificultadEjercicio(event.target.value)
  }

  const [PermitirIAEjercicio, SetPermitirIAEjercicio] = useState(true)
  const SetterPermitirIAEjercicio = (event) => {
    SetPermitirIAEjercicio(event.target.checked)
  }

  const [VerRespuestaEsperada, SetVerRespuestaEsperada] = useState(true)
  const SetterVerRespuestaEsperada = (event) => {
    SetVerRespuestaEsperada(event.target.checked)
  }

  const [IDDBSeleccionadaEjercicio, IDSetDBSeleccionadaEjercicio] = useState('')
  const IDSetterDBSeleccionadaEjercicio = (event) => {
    IDSetDBSeleccionadaEjercicio(event.target.value)
  }

  const [SolucionEjercicio, SetSolucionEjercicio] = useState('')
  const SetterSolucionEjercicio = (event) => {
    SetSolucionEjercicio(event.target.value)
  }

  const [ListaTopicosEjercicios, SetListaTopicosEjercicios] = useState([])
  const SetterListaTopicosEjercicios = (event) => {
    SetListaTopicosEjercicios(event.target.value)
  }
  const [TablaSolucionEjercicio, SetTablaSolucionEjercicio] = useState('')
  const SetterTablaSolucionEjercicio = (event) => {
    SetTablaSolucionEjercicio(event.target.value)
  }

  const [ListaTopicosEjercicio, SetListaTopicosEjercicio] = useState('')
  const SetterListaTopicosEjercicio = (event) => {
    SetListaTopicosEjercicio(event.target.value)
  }

  const [ID_Editar_ejercicio, SetID_Editar_ejercicio] = useState('')
  const SetterID_Editar_ejercicio = (event) => {
    SetID_Editar_ejercicio(event.target.value)
  }


  const [IdEjercicioResolver, SetIdEjercicioResolver] = useState('')
  const SetterIdEjercicioResolver = (event) => {
    SetIdEjercicioResolver(event.target.value)
  }

  const [MODOEDITAR, SetMODOEDITAR] = useState('')
  const SetterMODOEDITAR = (event) => {
    SetMODOEDITAR(event.target.value)
  }

  const [ProbarDBIDMENU, SetProbarDBIDMENU] = useState('')
  const SetterProbarDBIDMENU = (event) => {
    SetProbarDBIDMENU(event.target.value)
  }

  const [topicosSeleccionados, setTopicosSeleccionados] = useState([]);
  return (
    // Variables
    <EstadoGlobalContexto.Provider value={
      {
        valorGlobal, setValorGlobal,
        Logeado, SetLogedao,
        Nombre, SetNombre,
        Rol, SetRol,
        topicosSeleccionados, setTopicosSeleccionados,
        NombreEjercicio, SetNombreEjercicio, SetterNombreEjercicio,
        ResumenEjercicio, SetResumenEjercicio, SetterResumenEjercicio,
        ProblemaEjercicio, SetProblemaEjercicio, SetterProblemaEjercicio,
        DificultadEjercicio, SetDificultadEjercicio, SetterDificultadEjercicio,
        PermitirIAEjercicio, SetPermitirIAEjercicio, SetterPermitirIAEjercicio,
        VerRespuestaEsperada, SetVerRespuestaEsperada, SetterVerRespuestaEsperada,
        IDDBSeleccionadaEjercicio, IDSetDBSeleccionadaEjercicio, IDSetterDBSeleccionadaEjercicio,
        SolucionEjercicio, SetSolucionEjercicio, SetterSolucionEjercicio,
        ListaTopicosEjercicios, SetListaTopicosEjercicios, SetterListaTopicosEjercicios,
        TablaSolucionEjercicio, SetTablaSolucionEjercicio, SetterTablaSolucionEjercicio,
        ListaTopicosEjercicio, SetListaTopicosEjercicio, SetterListaTopicosEjercicio,
        ID_Editar_ejercicio, SetID_Editar_ejercicio, SetterID_Editar_ejercicio,
        IdEjercicioResolver, SetIdEjercicioResolver, SetterIdEjercicioResolver,
        MODOEDITAR, SetMODOEDITAR, SetterMODOEDITAR,
        ProbarDBIDMENU, SetProbarDBIDMENU, SetterProbarDBIDMENU

      }}>
      {children}
    </EstadoGlobalContexto.Provider>
  );
};