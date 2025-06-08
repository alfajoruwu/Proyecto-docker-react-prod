// ToastContext.js
import React, { createContext, useContext, useState } from 'react';

// Tipos de toast
// mostrarToast(mensaje, 'success', duracion);
// mostrarToast(mensaje, 'error', duracion);
// mostrarToast(mensaje, 'warning', duracion);

// Crear el contexto
const ToastContext = createContext();

// Crear el proveedor del contexto
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Función para agregar un nuevo toast
    const mostrarToast = (mensaje, tipo = 'warning', duracion = 3000) => {
        const id = Date.now(); // Generar un ID único para el toast
        setToasts((prevToasts) => [...prevToasts, { id, mensaje, tipo, duracion }]);

        // Eliminar el toast después de la duración especificada
        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        }, duracion);
    };

    return (
        <ToastContext.Provider value={{ mostrarToast }}>
            {children}

            {/* Renderizar todos los toasts */}
            <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {toasts.map(({ id, mensaje, tipo, duracion }) => (
                    <div
                        key={id}
                        className={`alert shadow-lg ${tipo === 'success'
                            ? 'alert-success'
                            : tipo === 'error'
                                ? 'alert-error'
                                : 'alert-warning'
                            }`}
                    >
                        <span>{mensaje}</span>
                        {/* Barra de tiempo restante */}
                        <div
                            className="h-1 bg-white rounded-full mt-2"
                            style={{
                                width: '100%',
                                animation: `progreso ${duracion}ms linear forwards`,
                            }}
                        ></div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe usarse dentro de un ToastProvider');
    }
    return context;
};