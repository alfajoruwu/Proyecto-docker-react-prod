import React, { createContext, useState } from 'react';

export const EstadoGlobalContexto = createContext();

export const ProveedorEstadoGlobal = ({ children }) => {

  const [valorGlobal, setValorGlobal] = useState('Valor inicial');


  return (
    <EstadoGlobalContexto.Provider value={{ valorGlobal, setValorGlobal }}>
      {children}
    </EstadoGlobalContexto.Provider>
  );
};