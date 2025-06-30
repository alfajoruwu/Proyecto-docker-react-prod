import React from 'react'
import { useToast } from '../../Componentes/ToastContext';
import { formatearFecha } from '../../AuxS/Utilidades';

import { FaDatabase, FaRegFileAlt, FaRegCalendarCheck, FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';

const MostrarCartasDB = ({ ListaBasesDatos, onEditarDB, onBorrarDB }) => {
    const { mostrarToast } = useToast();

    // Formatear fecha para mostrar
    const formatFecha = (fechaStr) => {
        if (!fechaStr) return 'Fecha desconocida';
        try {
            return formatearFecha(new Date(fechaStr));
        } catch (error) {
            return fechaStr;
        }
    };

    return (
        <div className='flex flex-row flex-wrap gap-3'>
            {ListaBasesDatos && ListaBasesDatos.length > 0 ? ListaBasesDatos.map((db) => (
                <div key={db.id} className="card card-compact w-full md:w-96 bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    {/* Header con degradado y estadística */}
                    <div className="bg-neutral p-4 rounded-t-xl">
                        <div className="flex justify-between items-center">
                            <h2 className="card-title text-base-100">{db.nombre || 'Sin nombre'}</h2>
                            <div className="badge badge-accent ">
                                <FaDatabase className="mr-1" /> {db.ejercicios_count || 0} ejercicios
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="card-body p-4 space-y-4">
                        {/* Información básica con iconos */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <FaRegFileAlt className="text-lg" />
                                <div>
                                    <p className="text-sm text-gray-500">Resumen</p>
                                    <p className="font-medium text-gray-500">{db.resumen || 'Sin descripción'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <FaRegCalendarCheck className="text-lg" />
                                <div>
                                    <p className="text-sm text-gray-500">Creación</p>
                                    <p className="font-medium text-gray-500">{formatFecha(db.fecha_creacion)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Acciones con diseño moderno */}
                        <div className="card-actions flex flex-col md:flex-row gap-3">
                            {/* Botón principal */}


                            {/* Botones secundarios */}
                            <div className="flex flex-1 gap-3">
                                <button
                                    className="btn btn-secondary btn-outline flex-1"
                                    onClick={() => onEditarDB(db.id)}
                                >
                                    <FaEdit className="mr-2" /> Editar
                                </button>

                                <button
                                    className="btn btn-error btn-outline flex-1"
                                    onClick={() => {
                                        if (window.confirm(`¿Eliminar "${db.nombre}"?`)) {
                                            onBorrarDB(db.id);
                                        }
                                    }}
                                >
                                    <FaTrashAlt className="mr-2" /> Borrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-center w-full py-10">
                    <h3 className="text-lg font-semibold">No hay bases de datos disponibles</h3>
                    <p className="mt-2">Crea una nueva base de datos haciendo clic en el botón "+"</p>
                </div>
            )}
        </div>
    );
}

export default MostrarCartasDB;